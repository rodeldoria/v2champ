import axios from 'axios';
import { Player, User, League, Team, Matchup, Transaction } from '../types/sleeper';

const BASE_URL = 'https://api.sleeper.app/v1';
const BATCH_SIZE = 3;
const BATCH_DELAY = 2000;
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;
const DEFAULT_TIMEOUT = 30000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: any = {}, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) => {
  try {
    const response = await axios(url, {
      ...options,
      timeout: options.timeout || DEFAULT_TIMEOUT,
    });
    return response;
  } catch (error) {
    if (retries === 0 || !axios.isAxiosError(error)) {
      throw error;
    }

    if (error.response?.status === 429) {
      await sleep(delay * 2);
    } else if (error.code === 'ECONNABORTED') {
      options.timeout = (options.timeout || DEFAULT_TIMEOUT) + 30000;
    } else {
      await sleep(delay);
    }

    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
};

export const fetchPlayerStats = async (
  playerId: string,
  season: string,
  week: number
): Promise<Record<string, number>> => {
  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/stats/nfl/regular/${season}/${week}?player_id=${playerId}`
    );
    
    if (!response.data || !response.data[playerId]) {
      return {};
    }
    
    return response.data[playerId];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        console.warn(`Timeout fetching stats for player ${playerId}, returning empty stats`);
      } else if (error.response?.status === 404) {
        console.warn(`No stats found for player ${playerId}`);
      } else {
        console.error(`Error fetching stats for player ${playerId}:`, error.message);
      }
    } else {
      console.error(`Unknown error fetching stats for player ${playerId}:`, error);
    }
    return {};
  }
};

export const fetchPlayerStatsBatch = async (
  playerIds: string[],
  season: string,
  week: number
): Promise<Record<string, Record<string, number>>> => {
  const results: Record<string, Record<string, number>> = {};
  
  for (let i = 0; i < playerIds.length; i += BATCH_SIZE) {
    const batch = playerIds.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(id => fetchPlayerStats(id, season, week));
    
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

export const fetchTrendingPlayers = async (
  sport: string = 'nfl',
  type: 'add' | 'drop' = 'add',
  lookback: number = 24,
  limit: number = 25
): Promise<string[]> => {
  try {
    const response = await fetchWithRetry(
      `${BASE_URL}/players/${sport}/trending/${type}?lookback_hours=${lookback}&limit=${limit}`
    );

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map(player => player.player_id);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching trending players:', error.message);
    } else {
      console.error('Unknown error fetching trending players:', error);
    }
    return [];
  }
};