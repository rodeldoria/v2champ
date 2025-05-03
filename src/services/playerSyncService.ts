import { supabase } from '../lib/supabase';
import { fetchAllPlayers } from './sleeperService';
import { getLastSync, updateLastSync } from './syncService';
import type { Player } from '../types/sleeper';

export async function syncPlayers() {
  try {
    // 1) Read last sync time
    const lastSync = await getLastSync('players_last_sync');

    // 2) Fetch all players from Sleeper
    const players = await fetchAllPlayers();

    // 3) Filter only those updated since lastSync
    const lastSyncDate = new Date(lastSync);
    const toSync = Object.values(players).filter(p => {
      if (!p.last_modified) return true; // Sync if no last_modified date
      return new Date(p.last_modified) > lastSyncDate;
    });

    // 4) Upsert into Supabase
    if (toSync.length) {
      const rows = toSync.map(p => ({
        player_id: p.player_id,
        first_name: p.first_name,
        last_name: p.last_name,
        team: p.team,
        position: p.position,
        stats: p,  // store full JSON
        last_synced: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('players')
        .upsert(rows, { onConflict: 'player_id' });

      if (error) throw error;
    }

    // 5) Update last sync timestamp
    await updateLastSync('players_last_sync');

    return {
      synced: toSync.length,
      total: Object.keys(players).length
    };
  } catch (error) {
    console.error('Error syncing players:', error);
    throw error;
  }
}

export async function syncPlayerStats(
  playerId: string,
  season: string,
  week: number
) {
  try {
    // Get player stats from Sleeper
    const response = await fetch(
      `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}?player_id=${playerId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch player stats');
    }
    
    const data = await response.json();
    const stats = data[playerId] || {};

    // Update player stats in Supabase
    const { error } = await supabase
      .from('players')
      .update({ 
        stats: { ...stats, last_synced: new Date().toISOString() }
      })
      .eq('player_id', playerId);

    if (error) throw error;

    return stats;
  } catch (error) {
    console.error('Error syncing player stats:', error);
    throw error;
  }
}

export async function getPlayerFromCache(playerId: string): Promise<Player | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) throw error;
    return data as unknown as Player;
  } catch (error) {
    console.error('Error getting player from cache:', error);
    return null;
  }
}

export async function getCachedPlayers(): Promise<Record<string, Player>> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*');

    if (error) throw error;

    // Convert array to record
    const players: Record<string, Player> = {};
    data.forEach(player => {
      players[player.player_id] = player as unknown as Player;
    });

    return players;
  } catch (error) {
    console.error('Error getting cached players:', error);
    return {};
  }
}