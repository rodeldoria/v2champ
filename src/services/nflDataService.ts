import { supabase } from '../lib/supabase';

/**
 * Interface for NFL player stats
 */
export interface NFLPlayerStats {
  player_id: string;
  player_name?: string;
  position?: string;
  team?: string;
  season: string;
  week: number;
  passing_yards?: number;
  passing_tds?: number;
  passing_ints?: number;
  rushing_yards?: number;
  rushing_tds?: number;
  receiving_yards?: number;
  receiving_tds?: number;
  receptions?: number;
  targets?: number;
  fantasy_points?: number;
  fantasy_points_ppr?: number;
}

/**
 * Get NFL player stats from the database
 * @param playerId The player ID
 * @param season The NFL season (e.g., "2023")
 * @param week The week number (0 for season totals)
 * @returns Player stats or null if not found
 */
export const getNFLPlayerStats = async (
  playerId: string,
  season: string,
  week: number = 0
): Promise<NFLPlayerStats | null> => {
  try {
    const { data, error } = await supabase
      .from('nfl_player_stats')
      .select('*')
      .eq('player_id', playerId)
      .eq('season', season)
      .eq('week', week)
      .single();
    
    if (error) {
      console.error('Error fetching NFL player stats:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Convert the stats JSON to a structured object
    const stats = data.stats || {};
    
    return {
      player_id: data.player_id,
      season: data.season,
      week: data.week,
      passing_yards: stats.passing_yards || stats.pass_yards || stats.pass_yd,
      passing_tds: stats.passing_tds || stats.pass_tds || stats.pass_td,
      passing_ints: stats.passing_ints || stats.pass_ints || stats.pass_int,
      rushing_yards: stats.rushing_yards || stats.rush_yards || stats.rush_yd,
      rushing_tds: stats.rushing_tds || stats.rush_tds || stats.rush_td,
      receiving_yards: stats.receiving_yards || stats.rec_yards || stats.rec_yd,
      receiving_tds: stats.receiving_tds || stats.rec_tds || stats.rec_td,
      receptions: stats.receptions || stats.rec,
      targets: stats.targets,
      fantasy_points: stats.fantasy_points || stats.fantasy_pts,
      fantasy_points_ppr: stats.fantasy_points_ppr || stats.fantasy_pts_ppr
    };
  } catch (error) {
    console.error('Error in getNFLPlayerStats:', error);
    return null;
  }
};

/**
 * Get NFL player stats for multiple players
 * @param playerIds Array of player IDs
 * @param season The NFL season (e.g., "2023")
 * @param week The week number (0 for season totals)
 * @returns Object mapping player IDs to their stats
 */
export const getNFLPlayerStatsBatch = async (
  playerIds: string[],
  season: string,
  week: number = 0
): Promise<Record<string, NFLPlayerStats>> => {
  try {
    const { data, error } = await supabase
      .from('nfl_player_stats')
      .select('*')
      .in('player_id', playerIds)
      .eq('season', season)
      .eq('week', week);
    
    if (error) {
      console.error('Error fetching NFL player stats batch:', error);
      return {};
    }
    
    const result: Record<string, NFLPlayerStats> = {};
    
    data.forEach(item => {
      const stats = item.stats || {};
      
      result[item.player_id] = {
        player_id: item.player_id,
        season: item.season,
        week: item.week,
        passing_yards: stats.passing_yards || stats.pass_yards || stats.pass_yd,
        passing_tds: stats.passing_tds || stats.pass_tds || stats.pass_td,
        passing_ints: stats.passing_ints || stats.pass_ints || stats.pass_int,
        rushing_yards: stats.rushing_yards || stats.rush_yards || stats.rush_yd,
        rushing_tds: stats.rushing_tds || stats.rush_tds || stats.rush_td,
        receiving_yards: stats.receiving_yards || stats.rec_yards || stats.rec_yd,
        receiving_tds: stats.receiving_tds || stats.rec_tds || stats.rec_td,
        receptions: stats.receptions || stats.rec,
        targets: stats.targets,
        fantasy_points: stats.fantasy_points || stats.fantasy_pts,
        fantasy_points_ppr: stats.fantasy_points_ppr || stats.fantasy_pts_ppr
      };
    });
    
    return result;
  } catch (error) {
    console.error('Error in getNFLPlayerStatsBatch:', error);
    return {};
  }
};

/**
 * Get NFL team stats from the database
 * @param team The team abbreviation (e.g., "KC")
 * @param season The NFL season (e.g., "2023")
 * @param week The week number (0 for season totals)
 * @returns Team stats or null if not found
 */
export const getNFLTeamStats = async (
  team: string,
  season: string,
  week: number = 0
): Promise<Record<string, any> | null> => {
  try {
    // First try to get from nfl_team_stats table
    const { data, error } = await supabase
      .from('nfl_team_stats')
      .select('*')
      .eq('team', team)
      .eq('season', season)
      .eq('week', week)
      .single();
    
    if (!error && data) {
      return data.stats || {};
    }
    
    // If not found, try to get from the data directory
    try {
      const response = await fetch(`/data/team_stats_${season}.csv`);
      if (!response.ok) {
        throw new Error(`Failed to fetch team stats: ${response.status} ${response.statusText}`);
      }
      
      const csvData = await response.text();
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      // Find the team's data
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const teamData: Record<string, any> = {};
        
        // Map CSV columns to object properties
        headers.forEach((header, index) => {
          teamData[header] = values[index];
        });
        
        if (teamData.team === team) {
          return teamData;
        }
      }
    } catch (error) {
      console.error('Error fetching team stats from CSV:', error);
    }
    
    return null;
  } catch (error) {
    console.error('Error in getNFLTeamStats:', error);
    return null;
  }
};

/**
 * Get NFL player advanced metrics
 * @param playerId The player ID
 * @param season The NFL season (e.g., "2023")
 * @returns Advanced metrics or null if not found
 */
export const getNFLPlayerAdvancedMetrics = async (
  playerId: string,
  season: string
): Promise<Record<string, any> | null> => {
  try {
    // Try to get from nfl_player_advanced_metrics table
    const { data, error } = await supabase
      .from('nfl_player_advanced_metrics')
      .select('*')
      .eq('player_id', playerId)
      .eq('season', season)
      .single();
    
    if (!error && data) {
      return data.metrics || {};
    }
    
    // If not found, calculate from play-by-play data
    // This would be a complex calculation in a real app
    // For now, return null
    return null;
  } catch (error) {
    console.error('Error in getNFLPlayerAdvancedMetrics:', error);
    return null;
  }
};

/**
 * Get NFL schedule for a specific season and week
 * @param season The NFL season (e.g., "2023")
 * @param week The week number
 * @returns Array of games or empty array if not found
 */
export const getNFLSchedule = async (
  season: string,
  week: number
): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('nfl_schedule')
      .select('*')
      .eq('season', season)
      .eq('week', week);
    
    if (error) {
      console.error('Error fetching NFL schedule:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getNFLSchedule:', error);
    return [];
  }
};

/**
 * Search for NFL players
 * @param query The search query
 * @returns Array of matching players
 */
export const searchNFLPlayers = async (query: string): Promise<any[]> => {
  try {
    // First try to search in cached_players table
    const { data, error } = await supabase
      .from('cached_players')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,team.eq.${query},position.eq.${query}`)
      .limit(20);
    
    if (error) {
      console.error('Error searching NFL players:', error);
      return [];
    }
    
    // Map to Player type
    return data.map(player => ({
      player_id: player.id,
      first_name: player.first_name,
      last_name: player.last_name,
      team: player.team,
      position: player.position
    })) || [];
  } catch (error) {
    console.error('Error in searchNFLPlayers:', error);
    return [];
  }
};