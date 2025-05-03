import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Player } from '../types/sleeper';

interface UsePlayersResult {
  players: Player[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  fetchPlayers: (options?: {
    search?: string;
    position?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
}

export const usePlayers = (): UsePlayersResult => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPlayers = async (options: {
    search?: string;
    position?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('players').select('*', { count: 'exact' });

      // Apply search filter
      if (options.search) {
        query = query.or(
          `first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%`
        );
      }

      // Apply position filter
      if (options.position && options.position !== 'ALL') {
        if (options.position === 'FLEX') {
          query = query.in('position', ['RB', 'WR', 'TE']);
        } else {
          query = query.eq('position', options.position);
        }
      }

      // Apply pagination
      if (options.limit) {
        query = query.range(
          options.offset || 0,
          (options.offset || 0) + options.limit - 1
        );
      }

      // Order by last name
      query = query.order('last_name');

      const { data, error, count } = await query;

      if (error) throw error;

      setPlayers(data as Player[]);
      if (count !== null) setTotalCount(count);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPlayers();
  }, []);

  return {
    players,
    loading,
    error,
    totalCount,
    fetchPlayers
  };
};