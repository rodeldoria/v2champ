import { supabase } from '../lib/supabase';
import type { Player } from '../types/sleeper';

export const syncPlayer = async (player: Player) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .upsert({
        player_id: player.player_id,
        first_name: player.first_name,
        last_name: player.last_name,
        team: player.team,
        position: player.position,
        stats: player.stats || {},
        last_synced: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error syncing player:', error);
    throw error;
  }
};

export const getPlayer = async (playerId: string) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('player_id', playerId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting player:', error);
    throw error;
  }
};

export const updatePlayerStats = async (playerId: string, stats: Record<string, number>) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .update({
        stats,
        last_synced: new Date().toISOString()
      })
      .eq('player_id', playerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating player stats:', error);
    throw error;
  }
};