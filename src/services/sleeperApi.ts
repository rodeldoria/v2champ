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

export const getPlayerNews = async (playerId: string, season?: string): Promise<any[]> => {
  try {
    let url = `${BASE_URL}/players/${playerId}/news`;
    if (season) {
      url += `?season=${season}`;
    }
    const response = await fetchWithRetry(url);
    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

const cache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000;

const getCacheKey = (type: string, ...args: any[]): string => {
  return `${type}:${args.join(':')}`;
};

const fetchWithCache = async (url: string, cacheKey: string): Promise<any> => {
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetchWithRetry(url);
  const data = response.data;
  cache.set(cacheKey, data);
  setTimeout(() => cache.delete(cacheKey), CACHE_TTL);
  return data;
};

export const getUserByUsername = async (username: string): Promise<User> => {
  const cacheKey = getCacheKey('user', username);
  const url = `${BASE_URL}/user/${username}`;
  return await fetchWithCache(url, cacheKey);
};

export const getUserById = async (userId: string): Promise<User> => {
  const cacheKey = getCacheKey('user', userId);
  const url = `${BASE_URL}/user/${userId}`;
  return await fetchWithCache(url, cacheKey);
};

export const getLeagues = async (userId: string, season: string): Promise<League[]> => {
  const cacheKey = getCacheKey('leagues', userId, season);
  const url = `${BASE_URL}/user/${userId}/leagues/nfl/${season}`;
  return await fetchWithCache(url, cacheKey);
};

export const getLeague = async (leagueId: string): Promise<League> => {
  const cacheKey = getCacheKey('league', leagueId);
  const url = `${BASE_URL}/league/${leagueId}`;
  return await fetchWithCache(url, cacheKey);
};

export const getTeams = async (leagueId: string): Promise<Team[]> => {
  const cacheKey = getCacheKey('teams', leagueId);
  const url = `${BASE_URL}/league/${leagueId}/rosters`;
  return await fetchWithCache(url, cacheKey);
};

export const getAllPlayers = async (): Promise<Record<string, Player>> => {
  const cacheKey = getCacheKey('allPlayers');
  const url = `${BASE_URL}/players/nfl`;
  return await fetchWithCache(url, cacheKey);
};

export const getPlayerStats = async (
  playerId: string,
  season: string,
  week: number
): Promise<Record<string, number>> => {
  const cacheKey = getCacheKey('stats', playerId, season, week);
  const url = `${BASE_URL}/stats/nfl/regular/${season}/${week}?player_id=${playerId}`;
  const data = await fetchWithCache(url, cacheKey);
  return data[playerId] || {};
};

export const getPlayerProjections = async (
  playerId: string,
  season: string,
  week: number
): Promise<Record<string, number>> => {
  const cacheKey = getCacheKey('projections', playerId, season, week);
  const url = `${BASE_URL}/projections/nfl/regular/${season}/${week}?player_id=${playerId}`;
  const data = await fetchWithCache(url, cacheKey);
  return data[playerId] || {};
};

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

export const getMatchups = async (leagueId: string, week: number): Promise<Matchup[]> => {
  const cacheKey = getCacheKey('matchups', leagueId, week);
  const url = `${BASE_URL}/league/${leagueId}/matchups/${week}`;
  return await fetchWithCache(url, cacheKey);
};

export const getTransactions = async (leagueId: string, week: number): Promise<Transaction[]> => {
  const cacheKey = getCacheKey('transactions', leagueId, week);
  const url = `${BASE_URL}/league/${leagueId}/transactions/${week}`;
  return await fetchWithCache(url, cacheKey);
};

export const getTrendingPlayers = async (
  sport: string = 'nfl',
  type: string = 'add',
  lookback: number = 24,
  limit: number = 25
): Promise<string[]> => {
  const cacheKey = getCacheKey('trending', sport, type, lookback, limit);
  const url = `${BASE_URL}/players/${sport}/trending/${type}?lookback_hours=${lookback}&limit=${limit}`;
  const data = await fetchWithCache(url, cacheKey);
  return data.map((p: any) => p.player_id);
};