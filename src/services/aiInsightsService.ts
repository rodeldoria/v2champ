import { Player } from '../types/sleeper';
import { supabase } from '../lib/supabase';
import { calculateAttributes } from './playerRatingService';

// Configuration for Ollama
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Cache for AI insights to reduce API calls
const insightsCache = new Map<string, { data: any; timestamp: number }>();

export interface PlayerInsight {
  performance: string;
  outlook: string;
  strengths: string[];
  weaknesses: string[];
  trajectory: string;
  risks: string[];
  attributes: Record<string, number>;
  confidence: number;
  lastUpdated: string;
}

// Validate Supabase configuration
const validateSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase configuration not found');
    return false;
  }
  
  // Check if the URL contains placeholder values
  if (url.includes('your-') || key.includes('your-')) {
    console.warn('Supabase configuration contains placeholder values');
    return false;
  }
  
  return true;
};

// Update player stats count in database
const updatePlayerStats = async (playerId: string) => {
  if (!validateSupabaseConfig()) return;

  try {
    // Check if player stats record exists
    const { data: existingStats, error } = await supabase
      .from('player_stats')
      .select('count')
      .eq('player_id', playerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking player stats:', error);
      return;
    }

    if (existingStats) {
      // Update existing record
      await supabase
        .from('player_stats')
        .update({ count: existingStats.count + 1 })
        .eq('player_id', playerId);
    } else {
      // Create new record
      await supabase
        .from('player_stats')
        .insert({ player_id: playerId, count: 1 });
    }
  } catch (error) {
    console.error('Error updating player stats count:', error);
  }
};

/**
 * Generate AI insights for a player using Ollama
 * @param player The player to analyze
 * @param stats Player statistics
 * @returns AI-generated insights
 */
export const generatePlayerInsights = async (
  player: Player,
  stats: Record<string, number> = {},
  retryCount = 0
): Promise<PlayerInsight> => {
  if (!player) {
    throw new Error('Player data is required');
  }

  // Check cache first
  const cacheKey = `player_insight_${player.player_id}`;
  const cached = insightsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Update player view count
  await updatePlayerStats(player.player_id);

  try {
    // Calculate attributes to provide to Ollama
    const attributes = calculateAttributes(player, stats);
    
    const prompt = `
      Analyze this NFL player and provide insights:
      Name: ${player.first_name} ${player.last_name}
      Position: ${player.position || 'Unknown'}
      Team: ${player.team || 'Unknown'}
      Stats: ${JSON.stringify(stats)}
      Attributes: ${JSON.stringify(attributes)}
      
      Provide a detailed analysis in JSON format.
    `;

    // Check if Supabase configuration is valid
    if (!validateSupabaseConfig()) {
      console.warn('Supabase configuration invalid or missing');
      return getFallbackInsights(player, attributes);
    }

    // Get Supabase URL and key
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    try {
      const ollamaUrl = `${supabaseUrl}/functions/v1/ollama-proxy/api/generate`;

      const response = await fetch(ollamaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          model: 'llama3',
          prompt: prompt,
          stream: false,
          format: 'json'
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let insights: PlayerInsight;
      
      try {
        // Parse the response - Ollama might return the JSON as a string
        insights = typeof data.response === 'string' 
          ? JSON.parse(data.response) 
          : data.response;
      } catch (e) {
        console.error('Error parsing Ollama response:', e);
        return getFallbackInsights(player, attributes);
      }
      
      // Add confidence and timestamp
      const result = {
        ...insights,
        confidence: 85, // Slightly lower confidence than OpenAI
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      insightsCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      // Store in database
      try {
        await storePlayerInsights(player.player_id, result);
      } catch (error) {
        console.error('Error storing player insights:', error);
      }

      return result;
    } catch (error) {
      // Try to get insights from database if available
      try {
        const { data, error: dbError } = await supabase
          .from('player_insights')
          .select('insights, created_at')
          .eq('player_id', player.player_id)
          .single();

        if (!dbError && data && data.insights) {
          console.log('Using cached insights from database');
          return {
            ...data.insights,
            lastUpdated: data.created_at
          };
        }
      } catch (dbError) {
        console.error('Error getting insights from database:', dbError);
      }

      throw error;
    }
  } catch (error) {
    console.error('Error generating AI insights:', error);

    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount)));
      return generatePlayerInsights(player, stats, retryCount + 1);
    }

    return getFallbackInsights(player, calculateAttributes(player, stats));
  }
};

/**
 * Store player insights in the database
 */
const storePlayerInsights = async (playerId: string, insights: PlayerInsight) => {
  if (!validateSupabaseConfig()) return;

  try {
    // Convert insights to a format suitable for storage
    const insightsData = {
      performance: insights.performance,
      outlook: insights.outlook,
      strengths: insights.strengths,
      weaknesses: insights.weaknesses,
      trajectory: insights.trajectory,
      risks: insights.risks,
      attributes: insights.attributes,
      confidence: insights.confidence,
      last_updated: insights.lastUpdated
    };

    // Store in database
    const { error } = await supabase
      .from('player_insights')
      .upsert({ 
        player_id: playerId, 
        insights: insightsData,
        created_at: new Date().toISOString()
      }, { 
        onConflict: 'player_id' 
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error storing player insights:', error);
    throw error;
  }
};

/**
 * Generate fallback insights when Ollama is unavailable
 */
const getFallbackInsights = (player: Player, attributes: Record<string, number> = {}): PlayerInsight => {
  const position = player.position || 'Unknown';
  const playerName = `${player.first_name} ${player.last_name}`;

  // Position-specific insights
  let insights: Partial<PlayerInsight> = {};
  
  switch (position) {
    case 'QB':
      insights = {
        performance: `${playerName} has shown solid decision-making and arm talent in recent games.`,
        outlook: "Continues to develop as a passer with good upside in the right matchups.",
        strengths: ["Accuracy", "Decision Making", "Field Vision"],
        weaknesses: ["Occasional inaccuracy", "Limited mobility"],
        trajectory: "Steady improvement expected as the season progresses.",
        risks: ["Offensive line concerns", "Tough upcoming schedule"]
      };
      break;
    case 'RB':
      insights = {
        performance: `${playerName} has been a reliable contributor in the running game with consistent production.`,
        outlook: "Should maintain a solid role in the offense with good volume.",
        strengths: ["Vision", "Yards after contact", "Consistency"],
        weaknesses: ["Limited receiving work", "Touchdown dependency"],
        trajectory: "Stable production with potential for increased usage.",
        risks: ["Workload management", "Committee approach"]
      };
      break;
    case 'WR':
      insights = {
        performance: `${playerName} has shown flashes of playmaking ability and route-running skills.`,
        outlook: "Developing into a reliable target with upside in PPR formats.",
        strengths: ["Route running", "Separation", "Hands"],
        weaknesses: ["Contested catches", "Red zone usage"],
        trajectory: "Trending upward with increasing target share.",
        risks: ["Target competition", "Quarterback play"]
      };
      break;
    case 'TE':
      insights = {
        performance: `${playerName} has been a solid contributor in the passing game when targeted.`,
        outlook: "Offers streaming potential in favorable matchups.",
        strengths: ["Red zone presence", "Reliable hands", "Blocking ability"],
        weaknesses: ["Limited volume", "Inconsistent usage"],
        trajectory: "Role should remain stable with occasional spike weeks.",
        risks: ["Low target floor", "Touchdown dependency"]
      };
      break;
    default:
      insights = {
        performance: `${playerName} has shown typical performance for their position.`,
        outlook: "Continues to develop with standard expectations.",
        strengths: ["Versatility", "Consistency", "Role understanding"],
        weaknesses: ["Limited ceiling", "Matchup dependency"],
        trajectory: "Steady performance expected moving forward.",
        risks: ["Role changes", "Team scheme adjustments"]
      };
  }

  return {
    ...insights,
    attributes: attributes,
    confidence: 70, // Lower confidence for fallback
    lastUpdated: new Date().toISOString()
  } as PlayerInsight;
};

/**
 * Check if Ollama is available
 */
export const checkOllamaAvailability = async (): Promise<boolean> => {
  if (!validateSupabaseConfig()) return false;

  try {
    // Get Supabase URL and key
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log("Checking Ollama availability via proxy...");
    const response = await fetch(`${supabaseUrl}/functions/v1/ollama-proxy/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    console.log("Ollama proxy response status:", response.status);
    return response.ok;
  } catch (error) {
    console.error('Error checking Ollama availability:', error);
    return false;
  }
};

/**
 * Get player insights from the database or generate them if not available
 */
export const getPlayerInsights = async (
  player: Player,
  stats: Record<string, number> = {}
): Promise<PlayerInsight> => {
  if (!player) {
    throw new Error('Player data is required');
  }

  try {
    // Check if insights exist in the database
    if (validateSupabaseConfig()) {
      try {
        const { data, error } = await supabase
          .from('player_insights')
          .select('insights, created_at')
          .eq('player_id', player.player_id)
          .single();

        // If insights exist and are less than 24 hours old, return them
        if (!error && data) {
          const createdAt = new Date(data.created_at);
          const now = new Date();
          const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

          if (hoursSinceCreation < 24) {
            return {
              ...data.insights,
              lastUpdated: data.created_at
            };
          }
        }
      } catch (dbError) {
        console.warn('Error checking database for insights:', dbError);
      }
    }

    // Generate new insights
    return await generatePlayerInsights(player, stats);
  } catch (error) {
    console.error('Error getting player insights:', error);
    return getFallbackInsights(player, calculateAttributes(player, stats));
  }
};

/**
 * Process insights for all players in the database
 * This can be run as a scheduled job
 */
export const processAllPlayerInsights = async () => {
  try {
    // Check if Ollama is available
    const ollamaAvailable = await checkOllamaAvailability();
    if (!ollamaAvailable) {
      throw new Error('Ollama is not available. Please make sure it is running on your machine.');
    }

    // Check if Supabase URL and key are valid
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-') || 
        supabaseKey.includes('your-')) {
      throw new Error('Invalid Supabase configuration. Please check your environment variables.');
    }

    // Get all players from the database
    const { data: players, error } = await supabase
      .from('cached_players')
      .select('*');

    if (error) throw error;
    if (!players || players.length === 0) {
      return { processed: 0, errors: 0, message: 'No players found in the database' };
    }

    // Convert to Player type
    const playerObjects = players.map(p => ({
      player_id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      team: p.team,
      position: p.position,
      age: p.age
    })) as Player[];

    // Process players in batches
    return await batchProcessPlayerInsights(playerObjects);
  } catch (error) {
    console.error('Error processing all player insights:', error);
    throw error;
  }
};

/**
 * Get the most viewed players with their insights
 * @param limit Number of players to return
 */
export const getMostViewedPlayersWithInsights = async (limit: number = 10): Promise<any[]> => {
  try {
    // Check if Supabase URL and key are valid
    if (!validateSupabaseConfig()) {
      console.warn('Invalid Supabase configuration');
      return [];
    }

    // Get most viewed players
    const { data: playerStats, error } = await supabase
      .from('player_stats')
      .select('player_id, count')
      .order('count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!playerStats || playerStats.length === 0) {
      return [];
    }

    // Get player details and insights
    const playerInsights = await Promise.all(
      playerStats.map(async (stat) => {
        try {
          // Get player details
          const { data: player } = await supabase
            .from('cached_players')
            .select('*')
            .eq('id', stat.player_id)
            .single();

          // Get player insights
          const { data: insight } = await supabase
            .from('player_insights')
            .select('insights')
            .eq('player_id', stat.player_id)
            .single();

          return {
            player: player,
            insights: insight?.insights || null,
            views: stat.count
          };
        } catch (error) {
          console.error(`Error fetching details for player ${stat.player_id}:`, error);
          return null;
        }
      })
    );

    return playerInsights.filter(Boolean);
  } catch (error) {
    console.error('Error getting most viewed players with insights:', error);
    return [];
  }
};

/**
 * Process player insights in batches
 */
export const batchProcessPlayerInsights = async (players: Player[]): Promise<{ processed: number; errors: number }> => {
  let processed = 0;
  let errors = 0;

  // Process in batches of 5
  const BATCH_SIZE = 5;
  const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

  for (let i = 0; i < players.length; i += BATCH_SIZE) {
    const batch = players.slice(i, i + BATCH_SIZE);
    
    console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(players.length/BATCH_SIZE)}...`);
    
    const batchPromises = batch.map(async (player) => {
      try {
        await generatePlayerInsights(player);
        processed++;
        return { player_id: player.player_id, success: true };
      } catch (error) {
        console.error(`Error processing player ${player.first_name} ${player.last_name}:`, error);
        errors++;
        return { player_id: player.player_id, success: false, error };
      }
    });

    await Promise.all(batchPromises);
    
    // Add delay between batches to avoid overwhelming Ollama
    if (i + BATCH_SIZE < players.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  return { processed, errors };
};