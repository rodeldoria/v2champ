import { Player } from '../types/sleeper';
import { OpenAI } from 'openai';

interface NewsArticle {
  summary: string;
  date: string;
  source: string;
  type: 'team' | 'player';
  verified: boolean;
  url: string;
}

const VERIFIED_SOURCES = [
  'espn.com',
  'nfl.com',
  'sports.yahoo.com',
  'cbssports.com',
  'profootballfocus.com',
  'nflnetwork.com',
  'foxsports.com'
];

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const QUOTA_RESET_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const getSourceUrl = (source: string): string => {
  if (source.includes('espn')) return 'https://www.espn.com/nfl/';
  if (source.includes('nfl.com')) return 'https://www.nfl.com/news/';
  if (source.includes('yahoo')) return 'https://sports.yahoo.com/nfl/';
  if (source.includes('cbs')) return 'https://www.cbssports.com/nfl/';
  if (source.includes('pff')) return 'https://www.pff.com/nfl/';
  if (source.includes('fox')) return 'https://www.foxsports.com/nfl';
  return '#';
};

const isVerifiedSource = (source: string): boolean => {
  return VERIFIED_SOURCES.some(vs => source.toLowerCase().includes(vs));
};

const createFallbackArticle = (message: string): NewsArticle => ({
  summary: message,
  date: new Date().toISOString(),
  source: 'System',
  type: 'player',
  verified: true,
  url: '#'
});

const getDefaultArticles = (player: Player): NewsArticle[] => [
  {
    summary: `${player.first_name} ${player.last_name} (${player.position || 'Unknown'}) continues to play for ${player.team || 'their team'}. Check official sources for the latest updates.`,
    date: new Date().toISOString(),
    source: 'System',
    type: 'player',
    verified: true,
    url: '#'
  }
];

let openai: OpenAI | null = null;

// Initialize OpenAI client only if API key is available and valid
const initializeOpenAI = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey.includes('your-') || apiKey.length < 20) {
    console.warn('Invalid or missing OpenAI API key');
    return null;
  }

  if (!openai && apiKey) {
    try {
      openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
      console.error('Error initializing OpenAI client:', error);
      return null;
    }
  }
  return openai;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getCachedNews = (player: Player): { data: NewsArticle[] | null; expired: boolean } => {
  const cacheKey = `player_news_${player.player_id}`;
  const cachedNews = localStorage.getItem(cacheKey);
  
  if (!cachedNews) {
    return { data: null, expired: true };
  }

  try {
    const { data, timestamp } = JSON.parse(cachedNews);
    const expired = Date.now() - timestamp > CACHE_DURATION;
    return { data, expired };
  } catch (e) {
    console.error('Error parsing cached news:', e);
    return { data: null, expired: true };
  }
};

const setCachedNews = (player: Player, articles: NewsArticle[]) => {
  const cacheKey = `player_news_${player.player_id}`;
  localStorage.setItem(cacheKey, JSON.stringify({
    data: articles,
    timestamp: Date.now()
  }));
};

const isQuotaError = (error: any): boolean => {
  return (
    error instanceof Error && (
      error.message.includes('quota') ||
      error.message.includes('429') ||
      error.message.includes('rate limit') ||
      error.message.includes('exceeded') ||
      error.message.includes('401') // Include 401 errors as they might be related to API key issues
    )
  );
};

const isQuotaExceeded = () => {
  const quotaState = localStorage.getItem('perplexity_quota_state');
  if (quotaState) {
    const { exceeded, resetTime } = JSON.parse(quotaState);
    if (exceeded && resetTime && Date.now() < resetTime) {
      return true;
    }
    if (Date.now() >= resetTime) {
      localStorage.removeItem('perplexity_quota_state');
    }
  }
  return false;
};

const setQuotaExceeded = () => {
  localStorage.setItem('perplexity_quota_state', JSON.stringify({
    exceeded: true,
    resetTime: Date.now() + QUOTA_RESET_DURATION
  }));
};

export const getPlayerNews = async (player: Player, retryCount = 0): Promise<NewsArticle[]> => {
  if (!player) {
    return [createFallbackArticle('Player information not available')];
  }

  // Check if quota is exceeded
  if (isQuotaExceeded()) {
    const quotaState = JSON.parse(localStorage.getItem('perplexity_quota_state') || '{}');
    const timeRemaining = Math.ceil((quotaState.resetTime - Date.now()) / (60 * 1000));
    return [
      createFallbackArticle(`AI news temporarily unavailable. Please try again in ${timeRemaining} minutes.`),
      ...getDefaultArticles(player)
    ];
  }

  // Check cache first
  const { data: cachedNews, expired } = getCachedNews(player);
  if (cachedNews && !expired) {
    return cachedNews;
  }

  // Initialize OpenAI client
  const client = initializeOpenAI();
  if (!client) {
    const message = 'AI-powered news is currently unavailable due to configuration issues. Using cached data.';
    return [createFallbackArticle(message), ...(cachedNews || getDefaultArticles(player))];
  }

  try {
    const prompt = `
      Generate 3-5 recent news items about NFL player ${player.first_name} ${player.last_name} (${player.position || 'Unknown'}) 
      who plays for ${player.team || 'Unknown Team'}.
      
      For each news item, include:
      1. A factual summary of recent performance, injury updates, or team role
      2. A real news source (ESPN, NFL.com, etc.)
      3. A plausible recent date within the last month
      4. Whether it's team or player focused
      5. A real URL to the source website
      
      Format as JSON array with:
      {
        "articles": [
          {
            "summary": "detailed news content",
            "source": "source name",
            "date": "2024-03-XX",
            "type": "player" or "team",
            "verified": true/false based on source reliability,
            "url": "https://source-url"
          }
        ]
      }
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a sports news analyst specializing in NFL player analysis and fantasy football insights. Generate realistic, factual news summaries with real sources and URLs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = JSON.parse(completion.choices[0].message.content);
    
    const articles = response.articles.map((article: any) => ({
      summary: article.summary,
      date: new Date(article.date).toISOString(),
      source: article.source,
      type: article.type as 'team' | 'player',
      verified: isVerifiedSource(article.source),
      url: getSourceUrl(article.source)
    }));

    setCachedNews(player, articles);
    return articles;

  } catch (error) {
    console.error('Error fetching player news:', error);
    
    if (isQuotaError(error)) {
      setQuotaExceeded();
      const message = 'News feed temporarily unavailable. Using cached data.';
      return [createFallbackArticle(message), ...(cachedNews || getDefaultArticles(player))];
    }

    if (retryCount < MAX_RETRIES) {
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      await delay(retryDelay);
      return getPlayerNews(player, retryCount + 1);
    }

    const errorMessage = 'Unable to fetch fresh news. Using cached data.';
    const fallbackNews = cachedNews || getDefaultArticles(player);
    
    return [createFallbackArticle(errorMessage), ...fallbackNews];
  }
};