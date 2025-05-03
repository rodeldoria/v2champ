import axios from 'axios';
import { Player, User, League, Team, Matchup, Transaction } from '../types/sleeper';

const BASE_URL = 'https://api.sleeper.app/v1';
const BATCH_SIZE = 3;
const BATCH_DELAY = 2000;
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to add delay between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with retry and caching
const fetchWithCache = async (url: string, options: any = {}, cacheKey?: string): Promise<any> => {
  // Check cache if cacheKey is provided
  if (cacheKey) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  // Fetch with retry
  let retries = MAX_RETRIES;
  let delay = INITIAL_RETRY_DELAY;
  
  while (retries >= 0) {
    try {
      const response = await axios(url, {
        ...options,
        timeout: options.timeout || REQUEST_TIMEOUT,
      });
      
      // Cache the response if cacheKey is provided
      if (cacheKey) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      if (retries === 0) throw error;
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          // Rate limited, wait longer
          await sleep(delay * 2);
        } else if (error.code === 'ECONNABORTED') {
          // Timeout, increase timeout for next attempt
          options.timeout = (options.timeout || REQUEST_TIMEOUT) + 30000;
        } else {
          await sleep(delay);
        }
      } else {
        await sleep(delay);
      }
      
      retries--;
      delay *= 2;
    }
  }
  
  throw new Error('Failed to fetch after retries');
};

// Get player by ID
export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    const players = await getAllPlayers();
    return players[playerId] || null;
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
};

// Get all players
export const getAllPlayers = async (): Promise<Record<string, Player>> => {
  try {
    return await fetchWithCache(`${BASE_URL}/players/nfl`, {}, 'all_players');
  } catch (error) {
    console.error('Error fetching all players:', error);
    return {};
  }
};

// Get player stats
export const getPlayerStats = async (
  playerId: string,
  season: string,
  week: number
): Promise<Record<string, number>> => {
  try {
    const cacheKey = `player_stats:${playerId}:${season}:${week}`;
    const data = await fetchWithCache(
      `${BASE_URL}/stats/nfl/regular/${season}/${week}?player_id=${playerId}`,
      {},
      cacheKey
    );
    return data[playerId] || {};
  } catch (error) {
    console.error(`Error fetching stats for player ${playerId}:`, error);
    return {};
  }
};

// Get player projections
export const getPlayerProjections = async (
  playerId: string,
  season: string,
  week: number
): Promise<Record<string, number>> => {
  try {
    const cacheKey = `player_projections:${playerId}:${season}:${week}`;
    const data = await fetchWithCache(
      `${BASE_URL}/projections/nfl/regular/${season}/${week}?player_id=${playerId}`,
      {},
      cacheKey
    );
    return data[playerId] || {};
  } catch (error) {
    console.error(`Error fetching projections for player ${playerId}:`, error);
    return {};
  }
};

// Get player stats in batches
export const getPlayerStatsBatch = async (
  playerIds: string[],
  season: string,
  week: number
): Promise<Record<string, Record<string, number>>> => {
  const results: Record<string, Record<string, number>> = {};
  
  for (let i = 0; i < playerIds.length; i += BATCH_SIZE) {
    const batch = playerIds.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(id => getPlayerStats(id, season, week));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      batch.forEach((id, index) => {
        if (Object.keys(batchResults[index]).length > 0) {
          results[id] = batchResults[index];
        }
      });
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
    }
    
    if (i + BATCH_SIZE < playerIds.length) {
      await sleep(BATCH_DELAY);
    }
  }
  
  return results;
};

// Get user by username
export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    return await fetchWithCache(`${BASE_URL}/user/${username}`, {}, `user:${username}`);
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Get user leagues
export const getUserLeagues = async (userId: string, season: string): Promise<League[]> => {
  try {
    const cacheKey = `user_leagues:${userId}:${season}`;
    return await fetchWithCache(`${BASE_URL}/user/${userId}/leagues/nfl/${season}`, {}, cacheKey);
  } catch (error) {
    console.error('Error fetching user leagues:', error);
    return [];
  }
};

// Get league details
export const getLeague = async (leagueId: string): Promise<League | null> => {
  try {
    const cacheKey = `league:${leagueId}`;
    return await fetchWithCache(`${BASE_URL}/league/${leagueId}`, {}, cacheKey);
  } catch (error) {
    console.error('Error fetching league:', error);
    return null;
  }
};

// Get league rosters/teams
export const getLeagueRosters = async (leagueId: string): Promise<Team[]> => {
  try {
    const cacheKey = `league_rosters:${leagueId}`;
    return await fetchWithCache(`${BASE_URL}/league/${leagueId}/rosters`, {}, cacheKey);
  } catch (error) {
    console.error('Error fetching league rosters:', error);
    return [];
  }
};

// Get league users
export const getLeagueUsers = async (leagueId: string): Promise<User[]> => {
  try {
    const cacheKey = `league_users:${leagueId}`;
    return await fetchWithCache(`${BASE_URL}/league/${leagueId}/users`, {}, cacheKey);
  } catch (error) {
    console.error('Error fetching league users:', error);
    return [];
  }
};

// Get league matchups
export const getLeagueMatchups = async (leagueId: string, week: number): Promise<Matchup[]> => {
  try {
    const cacheKey = `league_matchups:${leagueId}:${week}`;
    return await fetchWithCache(`${BASE_URL}/league/${leagueId}/matchups/${week}`, {}, cacheKey);
  } catch (error) {
    console.error('Error fetching league matchups:', error);
    return [];
  }
};

// Get league transactions
export const getLeagueTransactions = async (leagueId: string, week: number): Promise<Transaction[]> => {
  try {
    const cacheKey = `league_transactions:${leagueId}:${week}`;
    return await fetchWithCache(`${BASE_URL}/league/${leagueId}/transactions/${week}`, {}, cacheKey);
  } catch (error) {
    console.error('Error fetching league transactions:', error);
    return [];
  }
};

// Get trending players
export const getTrendingPlayers = async (
  type: 'add' | 'drop' = 'add',
  lookback: number = 24,
  limit: number = 25
): Promise<string[]> => {
  try {
    const cacheKey = `trending_players:${type}:${lookback}:${limit}`;
    const data = await fetchWithCache(
      `${BASE_URL}/players/nfl/trending/${type}?lookback_hours=${lookback}&limit=${limit}`,
      {},
      cacheKey
    );
    return data.map((player: any) => player.player_id);
  } catch (error) {
    console.error('Error fetching trending players:', error);
    return [];
  }
};

// Get player news
export const getPlayerNews = async (playerId: string): Promise<any[]> => {
  try {
    const cacheKey = `player_news:${playerId}`;
    return await fetchWithCache(`${BASE_URL}/players/${playerId}/news`, {}, cacheKey);
  } catch (error) {
    console.error('Error fetching player news:', error);
    return [];
  }
};

// Get player image URL
export const getPlayerImageUrl = (playerId: string): string => {
  return `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
};

// Get team logo URL
export const getTeamLogoUrl = (team: string | undefined): string | null => {
  if (!team) return null;
  return `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png`;
};

// Get user avatar URL
export const getUserAvatarUrl = (avatarId: string | undefined): string | null => {
  if (!avatarId) return null;
  return `https://sleepercdn.com/avatars/${avatarId}`;
};

// Enhanced player data with additional metrics
export const enhancePlayerData = (player: Player, stats: Record<string, number> = {}): Player => {
  if (!player) return player;
  
  // Calculate fantasy points
  const fantasyPoints = calculateFantasyPoints(stats);
  
  // Add fantasy points to player
  return {
    ...player,
    fantasy_points: fantasyPoints
  };
};

// Calculate fantasy points
const calculateFantasyPoints = (stats: Record<string, number>): number => {
  if (!stats) return 0;
  
  let points = 0;
  
  // Passing
  points += (stats.pass_yd || 0) * 0.04;
  points += (stats.pass_td || 0) * 4;
  points += (stats.pass_int || 0) * -1;
  
  // Rushing
  points += (stats.rush_yd || 0) * 0.1;
  points += (stats.rush_td || 0) * 6;
  
  // Receiving (PPR)
  points += (stats.rec || 0) * 1;
  points += (stats.rec_yd || 0) * 0.1;
  points += (stats.rec_td || 0) * 6;
  
  return points;
};