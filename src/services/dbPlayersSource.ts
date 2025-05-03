import { PlayersDataSource } from './playersDataSource';
import { supabase } from '../lib/supabase';
import { Player } from '../types/sleeper';

export class DbPlayersDataSource implements PlayersDataSource {
  async fetchAllPlayers(): Promise<Record<string, Player>> {
    const { data, error } = await supabase
      .from('players')
      .select('*');

    if (error) throw error;

    // Convert array to record
    const players: Record<string, Player> = {};
    data?.forEach(player => {
      players[player.player_id] = {
        player_id: player.player_id,
        first_name: player.first_name,
        last_name: player.last_name,
        team: player.team || undefined,
        position: player.position || undefined,
        age: player.age || undefined,
        ...player.stats
      };
    });

    return players;
  }

  async fetchPlayerById(id: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('player_id', id)
      .single();

    if (error) return null;

    return {
      player_id: data.player_id,
      first_name: data.first_name,
      last_name: data.last_name,
      team: data.team || undefined,
      position: data.position || undefined,
      age: data.age || undefined,
      ...data.stats
    };
  }

  async fetchPlayersByIds(ids: string[]): Promise<Record<string, Player>> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .in('player_id', ids);

    if (error) throw error;

    const players: Record<string, Player> = {};
    data?.forEach(player => {
      players[player.player_id] = {
        player_id: player.player_id,
        first_name: player.first_name,
        last_name: player.last_name,
        team: player.team || undefined,
        position: player.position || undefined,
        age: player.age || undefined,
        ...player.stats
      };
    });

    return players;
  }

  async fetchPlayerStats(
    playerId: string,
    season: string,
    week: number
  ): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('player_stats')
      .select('stats')
      .eq('player_id', playerId)
      .eq('season', season)
      .eq('week', week)
      .single();

    if (error) return {};
    return data?.stats || {};
  }

  async fetchPlayerStatsBatch(
    playerIds: string[],
    season: string,
    week: number
  ): Promise<Record<string, Record<string, number>>> {
    const { data, error } = await supabase
      .from('player_stats')
      .select('player_id, stats')
      .in('player_id', playerIds)
      .eq('season', season)
      .eq('week', week);

    if (error) return {};

    const results: Record<string, Record<string, number>> = {};
    data?.forEach(row => {
      if (row.stats) {
        results[row.player_id] = row.stats;
      }
    });

    return results;
  }

  async fetchPlayerProjections(
    playerId: string,
    season: string,
    week: number
  ): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('player_projections')
      .select('projections')
      .eq('player_id', playerId)
      .eq('season', season)
      .eq('week', week)
      .single();

    if (error) return {};
    return data?.projections || {};
  }

  async fetchPlayerCareerStats(
    playerId: string,
    seasons: string[] = ['2024', '2023', '2022', '2021', '2020']
  ): Promise<Record<string, Record<string, number>>> {
    const { data, error } = await supabase
      .from('player_stats')
      .select('season, stats')
      .eq('player_id', playerId)
      .in('season', seasons)
      .order('season', { ascending: false });

    if (error) return {};

    const careerStats: Record<string, Record<string, number>> = {};
    data?.forEach(row => {
      if (row.stats) {
        careerStats[row.season] = row.stats;
      }
    });

    return careerStats;
  }

  async searchPlayers(query: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,team.ilike.%${query}%`);

    if (error) return [];

    return data.map(player => ({
      player_id: player.player_id,
      first_name: player.first_name,
      last_name: player.last_name,
      team: player.team || undefined,
      position: player.position || undefined,
      age: player.age || undefined,
      ...player.stats
    }));
  }

  async filterPlayersByPosition(position: string): Promise<Player[]> {
    let query = supabase.from('players').select('*');

    if (position !== 'ALL') {
      if (position === 'FLEX') {
        query = query.in('position', ['RB', 'WR', 'TE']);
      } else {
        query = query.eq('position', position);
      }
    }

    const { data, error } = await query;
    if (error) return [];

    return data.map(player => ({
      player_id: player.player_id,
      first_name: player.first_name,
      last_name: player.last_name,
      team: player.team || undefined,
      position: player.position || undefined,
      age: player.age || undefined,
      ...player.stats
    }));
  }

  async fetchTrendingPlayers(
    type: 'add' | 'drop' = 'add',
    lookback: number = 24,
    limit: number = 25
  ): Promise<string[]> {
    const { data, error } = await supabase
      .from('players')
      .select('player_id')
      .order('last_synced', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data.map(p => p.player_id);
  }
}

// Export a singleton instance
export const dbPlayersSource = new DbPlayersDataSource();