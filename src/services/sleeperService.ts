import { Player, User, League, Team, Matchup, Transaction } from '../types/sleeper';

const BASE_URL = 'https://api.sleeper.app/v1';

// User endpoints
export const getUserByUsername = async (username: string): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/user/${username}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// League endpoints
export const fetchLeagues = async (userId: string, season: string): Promise<League[]> => {
  try {
    // Validate inputs to prevent bad requests
    if (!userId) {
      console.error('fetchLeagues: userId is required but was not provided');
      return [];
    }

    console.log(`Fetching leagues for user ${userId} and season ${season}`);
    const response = await fetch(`${BASE_URL}/user/${userId}/leagues/nfl/${season}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch leagues: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch leagues: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} leagues`);
    return data;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    // Return empty array instead of throwing to prevent cascading errors
    return [];
  }
};

export const fetchLeague = async (leagueId: string): Promise<League> => {
  try {
    const response = await fetch(`${BASE_URL}/league/${leagueId}`);
    if (!response.ok) throw new Error('Failed to fetch league');
    return await response.json();
  } catch (error) {
    console.error('Error fetching league:', error);
    throw error;
  }
};

// Roster endpoints
export const fetchTeams = async (leagueId: string): Promise<Team[]> => {
  try {
    const response = await fetch(`${BASE_URL}/league/${leagueId}/rosters`);
    if (!response.ok) throw new Error('Failed to fetch teams');
    return await response.json();
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

// Player endpoints
export const fetchAllPlayers = async (): Promise<Record<string, Player>> => {
  try {
    const response = await fetch(`${BASE_URL}/players/nfl`);
    if (!response.ok) throw new Error('Failed to fetch players');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all players:', error);
    throw error;
  }
};

export const fetchPlayerStats = async (
  playerId: string,
  season: string,
  week: number
): Promise<Record<string, number>> => {
  try {
    const response = await fetch(
      `${BASE_URL}/stats/nfl/regular/${season}/${week}?player_id=${playerId}`
    );
    if (!response.ok) throw new Error('Failed to fetch player stats');
    const data = await response.json();
    return data[playerId] || {};
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return {};
  }
};

export const fetchPlayerProjections = async (
  playerId: string,
  season: string,
  week: number
): Promise<Record<string, number>> => {
  try {
    const response = await fetch(
      `${BASE_URL}/projections/nfl/regular/${season}/${week}?player_id=${playerId}`
    );
    if (!response.ok) throw new Error('Failed to fetch player projections');
    const data = await response.json();
    return data[playerId] || {};
  } catch (error) {
    console.error('Error fetching player projections:', error);
    return {};
  }
};

// Matchup endpoints
export const fetchMatchups = async (leagueId: string, week: number): Promise<Matchup[]> => {
  try {
    const response = await fetch(`${BASE_URL}/league/${leagueId}/matchups/${week}`);
    if (!response.ok) throw new Error('Failed to fetch matchups');
    return await response.json();
  } catch (error) {
    console.error('Error fetching matchups:', error);
    return [];
  }
};

// Transaction endpoints
export const fetchTransactions = async (leagueId: string, week: number): Promise<Transaction[]> => {
  try {
    const response = await fetch(`${BASE_URL}/league/${leagueId}/transactions/${week}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Trending players endpoint
export const fetchTrendingPlayers = async (
  sport: string = 'nfl',
  type: 'add' | 'drop' = 'add',
  lookback: number = 24,
  limit: number = 25
): Promise<string[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/players/${sport}/trending/${type}?lookback_hours=${lookback}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch trending players');
    const data = await response.json();
    return data.map((p: any) => p.player_id);
  } catch (error) {
    console.error('Error fetching trending players:', error);
    return [];
  }
};

// Draft endpoints
export const fetchDrafts = async (leagueId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/league/${leagueId}/drafts`);
    if (!response.ok) throw new Error('Failed to fetch drafts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return [];
  }
};

export const fetchDraftPicks = async (draftId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/draft/${draftId}/picks`);
    if (!response.ok) throw new Error('Failed to fetch draft picks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching draft picks:', error);
    return [];
  }
};

// Utility functions
export const calculateStandings = (teams: Team[]) => {
  if (!teams || teams.length === 0) return [];
  
  return teams
    .map(team => ({
      ...team,
      winPercentage: team.wins / (team.wins + team.losses + (team.ties || 0))
    }))
    .sort((a, b) => {
      // First sort by win percentage
      if (b.winPercentage !== a.winPercentage) {
        return b.winPercentage - a.winPercentage;
      }
      // If win percentage is tied, sort by points for
      return (b.points_for || 0) - (a.points_for || 0);
    });
};