import { supabase } from '../lib/supabase';
import { Player } from '../types/sleeper';
import { calculatePlayerScores } from './playerAttributesService';

// Define types for draft data
export interface Draft {
  draft_id: string;
  league_id: string;
  status: string;
  type: string;
  season: string;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  draft_order: Record<string, number> | null;
  slot_to_roster_id: Record<string, number> | null;
  last_picked: number;
  start_time: number;
  created: number;
}

export interface DraftPick {
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  pick_no: number;
  draft_slot: number;
  draft_id: string;
  is_keeper: boolean | null;
  metadata: {
    years_exp: string;
    team: string;
    status: string;
    position: string;
    player_id: string;
    number: string;
    news_updated: string | null;
    last_name: string;
    injury_status: string | null;
    first_name: string;
  };
}

// Maximum number of retry attempts
const MAX_RETRIES = 3;
// Delay between retries (in milliseconds)
const RETRY_DELAY = 1000;

/**
 * Helper function to add delay between retries
 * @param ms Milliseconds to delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper function to handle API requests with retries
 * @param url API endpoint URL
 * @param retries Number of retries remaining
 * @returns Response data
 */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error('No data received from API');
    }
    
    return data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying fetch... (${retries} attempts remaining)`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, retries - 1);
    }
    
    throw new Error(`Failed to fetch data after ${MAX_RETRIES} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches a draft by ID from the Sleeper API
 * @param draftId The ID of the draft to fetch
 * @returns The draft data or null if not found
 */
export const fetchDraft = async (draftId: string): Promise<Draft | null> => {
  try {
    // Check if draftId is valid
    if (!draftId) {
      throw new Error('Invalid draft ID provided');
    }

    console.log(`Attempting to load draft with ID: ${draftId}`);
    const data = await fetchWithRetry(`https://api.sleeper.app/v1/draft/${draftId}`);
    return data;
  } catch (error) {
    console.error('Error fetching draft:', error);
    throw error;
  }
};

/**
 * Fetches draft picks for a specific draft
 * @param draftId The ID of the draft
 * @returns Array of draft picks
 */
export const fetchDraftPicks = async (draftId: string): Promise<DraftPick[]> => {
  try {
    // Check if draftId is valid
    if (!draftId) {
      throw new Error('Invalid draft ID provided');
    }

    console.log(`Attempting to load draft picks for draft ID: ${draftId}`);
    const data = await fetchWithRetry(`https://api.sleeper.app/v1/draft/${draftId}/picks`);
    return data;
  } catch (error) {
    console.error('Error fetching draft picks:', error);
    throw error;
  }
};

/**
 * Fetches all drafts for a league
 * @param leagueId The ID of the league
 * @returns Array of drafts
 */
export const fetchLeagueDrafts = async (leagueId: string): Promise<Draft[]> => {
  try {
    // Check if leagueId is valid
    if (!leagueId) {
      throw new Error('Invalid league ID provided');
    }

    console.log(`Attempting to load drafts for league ID: ${leagueId}`);
    const data = await fetchWithRetry(`https://api.sleeper.app/v1/league/${leagueId}/drafts`);
    return data;
  } catch (error) {
    console.error('Error fetching league drafts:', error);
    throw error;
  }
};

/**
 * Calculate boom probability for a player
 * @param player The player to calculate for
 * @returns Boom probability score (0-100)
 */
export const calculateBoomProbability = (player: any): number => {
  if (!player) return 50;
  
  // Base score
  let score = 50;
  
  // Adjust based on position
  switch (player.position) {
    case 'QB':
      // Mobile QBs have higher boom potential
      if (player.rush_yd > 300) score += 10;
      // High TD passers have higher boom potential
      if (player.pass_td > 30) score += 10;
      break;
    case 'RB':
      // Workhorse RBs have higher boom potential
      if (player.rush_att > 200) score += 10;
      // Receiving RBs have higher boom potential
      if (player.rec > 40) score += 10;
      break;
    case 'WR':
      // Deep threat WRs have higher boom potential
      if (player.rec_yd > 1000) score += 10;
      // High target WRs have higher boom potential
      if (player.targets > 100) score += 10;
      break;
    case 'TE':
      // Receiving TEs have higher boom potential
      if (player.rec > 60) score += 15;
      break;
  }
  
  // Adjust based on experience
  if (player.years_exp === 0) score -= 5; // Rookies less likely to boom
  if (player.years_exp && player.years_exp > 5) score += 5; // Veterans more consistent
  
  // Add some randomness
  score += Math.floor(Math.random() * 20) - 10;
  
  return Math.min(Math.max(score, 10), 99);
};

/**
 * Calculate bust risk for a player
 * @param player The player to calculate for
 * @returns Bust risk score (0-100)
 */
export const calculateBustRisk = (player: any): number => {
  if (!player) return 50;
  
  // Base score
  let score = 50;
  
  // Adjust based on position
  switch (player.position) {
    case 'QB':
      // Rookie QBs have higher bust risk
      if (player.years_exp === 0) score += 15;
      // QBs with high INT rates have higher bust risk
      if (player.pass_int > 15) score += 10;
      break;
    case 'RB':
      // Older RBs have higher bust risk
      if (player.age > 28) score += 15;
      // High usage RBs have higher bust risk
      if (player.rush_att > 300) score += 10;
      break;
    case 'WR':
      // WRs with low catch rates have higher bust risk
      if (player.catch_rate < 60) score += 10;
      break;
    case 'TE':
      // Rookie TEs have very high bust risk
      if (player.years_exp === 0) score += 20;
      break;
  }
  
  // Adjust based on injury history
  if (player.injury_status) score += 10;
  
  // Add some randomness
  score += Math.floor(Math.random() * 20) - 10;
  
  return Math.min(Math.max(score, 10), 99);
};

/**
 * Calculate breakout score for a player
 * @param player The player to calculate for
 * @returns Breakout score (0-100)
 */
export const calculateBreakoutScore = (player: any): number => {
  if (!player) return 50;
  
  // Base score
  let score = 50;
  
  // Adjust based on position and experience
  switch (player.position) {
    case 'QB':
      // 2nd year QBs have highest breakout potential
      if (player.years_exp === 1) score += 20;
      // 3rd year QBs also have good breakout potential
      if (player.years_exp === 2) score += 15;
      // Veteran QBs unlikely to break out
      if (player.years_exp && player.years_exp > 5) score -= 20;
      break;
    case 'RB':
      // 2nd year RBs have highest breakout potential
      if (player.years_exp === 1) score += 25;
      // Rookie RBs also have good breakout potential
      if (player.years_exp === 0) score += 20;
      // Veteran RBs unlikely to break out
      if (player.years_exp && player.years_exp > 4) score -= 25;
      break;
    case 'WR':
      // 3rd year WRs have highest breakout potential
      if (player.years_exp === 2) score += 25;
      // 2nd year WRs also have good breakout potential
      if (player.years_exp === 1) score += 20;
      // Veteran WRs unlikely to break out
      if (player.years_exp && player.years_exp > 5) score -= 20;
      break;
    case 'TE':
      // 3rd year TEs have highest breakout potential
      if (player.years_exp === 2) score += 30;
      // 2nd year TEs also have good breakout potential
      if (player.years_exp === 1) score += 20;
      // Rookie TEs unlikely to break out
      if (player.years_exp === 0) score -= 10;
      // Veteran TEs unlikely to break out
      if (player.years_exp && player.years_exp > 5) score -= 20;
      break;
  }
  
  // Add some randomness
  score += Math.floor(Math.random() * 20) - 10;
  
  return Math.min(Math.max(score, 10), 99);
};

// Generate player tags based on attributes and stats
export const generatePlayerTags = (player: any, stats: Record<string, number> = {}): string[] => {
  const tags: string[] = [];
  
  // Position-specific tags
  switch (player.position) {
    case 'QB':
      if (stats.rush_yd && stats.rush_yd > 300) tags.push('Dual Threat');
      if (stats.pass_td && stats.pass_td > 30) tags.push('High TD');
      if (stats.pass_int && stats.pass_int < 10) tags.push('Low INT');
      break;
    case 'RB':
      if (stats.rush_att && stats.rush_att > 200) tags.push('Workhorse');
      if (stats.rec && stats.rec > 40) tags.push('Receiving Back');
      if (stats.rush_td && stats.rush_td > 10) tags.push('TD Machine');
      break;
    case 'WR':
      if (stats.rec_yd && stats.rec_yd > 1000) tags.push('1000+ Yard');
      if (stats.targets && stats.targets > 100) tags.push('High Volume');
      if (stats.rec_td && stats.rec_td > 8) tags.push('Red Zone Threat');
      break;
    case 'TE':
      if (stats.rec && stats.rec > 60) tags.push('High Volume');
      if (stats.rec_td && stats.rec_td > 5) tags.push('Red Zone Threat');
      break;
  }
  
  // Experience tags
  if (player.years_exp === 0) tags.push('Rookie');
  if (player.years_exp === 1) tags.push('Sophomore');
  if (player.years_exp && player.years_exp > 8) tags.push('Veteran');
  
  // Value tags
  if (player.adp && player.rank && player.adp - player.rank > 20) tags.push('Value Pick');
  if (player.adp && player.rank && player.adp - player.rank < -20) tags.push('Reach Pick');
  
  // Injury tags
  if (player.injury_status) tags.push(player.injury_status);
  
  return tags;
};

// Enhance player data with additional metrics
export const enhancePlayerData = (player: any, stats: Record<string, number> = {}) => {
  if (!player) return player;
  
  // Calculate boom/bust/breakout scores
  const scores = calculatePlayerScores(player as Player);
  
  // Generate tags
  const tags = generatePlayerTags(player, stats);
  
  // Return enhanced player
  return {
    ...player,
    ...scores,
    tags
  };
};