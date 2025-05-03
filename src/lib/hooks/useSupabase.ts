import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Player } from '../../types/sleeper';

export const usePlayerCache = (playerId: string) => {
  const [data, setData] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data: player, error } = await supabase
          .from('cached_players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) throw error;
        setData(player as unknown as Player);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  return { data, loading, error };
};

export const usePlayerStats = (playerId: string, season: string, week: number) => {
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: stats, error } = await supabase
          .from('cached_player_stats')
          .select('stats')
          .eq('player_id', playerId)
          .eq('season', season)
          .eq('week', week)
          .single();

        if (error) throw error;
        setData(stats?.stats as Record<string, number>);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId, season, week]);

  return { data, loading, error };
};