import { Player } from '../types/sleeper';

interface SocialPost {
  content: string;
  platform: 'twitter' | 'instagram' | 'reddit';
  author: string;
  timestamp: string;
  url: string;
  verified: boolean;
  type: 'team' | 'player';
}

const VERIFIED_ACCOUNTS = [
  'NFL',
  'AdamSchefter',
  'RapSheet',
  'SleeperHQ',
  'FieldYates',
  'MatthewBerryTMR'
];

export const getSocialMediaPosts = async (player: Player): Promise<SocialPost[]> => {
  // This would normally fetch from social media APIs
  // For now, we'll generate some example posts
  const posts: SocialPost[] = [];
  
  if (player.team) {
    // Add team-related posts
    posts.push({
      content: `${player.team} offensive coordinator discusses plans for ${player.first_name} ${player.last_name}'s role in the offense. Expecting increased usage in the red zone.`,
      platform: 'twitter',
      author: 'NFL',
      timestamp: new Date().toISOString(),
      url: 'https://twitter.com/NFL',
      verified: true,
      type: 'team'
    });

    posts.push({
      content: `Breaking: ${player.team} head coach confirms ${player.first_name} ${player.last_name} will be a key part of the gameplan going forward. "He's earned more opportunities."`,
      platform: 'twitter',
      author: 'AdamSchefter',
      timestamp: new Date().toISOString(),
      url: 'https://twitter.com/AdamSchefter',
      verified: true,
      type: 'team'
    });
  }

  // Add player-specific posts
  posts.push({
    content: `${player.first_name} ${player.last_name} looking explosive in offseason workouts. Fantasy managers should take notice. 📈`,
    platform: 'twitter',
    author: 'FantasyPros',
    timestamp: new Date().toISOString(),
    url: 'https://twitter.com/FantasyPros',
    verified: false,
    type: 'player'
  });

  posts.push({
    content: `Film study: Breaking down ${player.first_name} ${player.last_name}'s performance from last week. Impressive vision and decision-making on display.`,
    platform: 'reddit',
    author: 'NFLAnalyst',
    timestamp: new Date().toISOString(),
    url: 'https://reddit.com/r/fantasyfootball',
    verified: false,
    type: 'player'
  });

  // Sort by timestamp descending (newest first)
  return posts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};