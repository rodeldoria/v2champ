import { useState, useEffect } from 'react';
import { Player } from '../types/sleeper';
import { getPlayerById, getPlayerStats, getPlayerProjections } from '../services/sleeperApiService';
import { calculatePlayerScores } from '../services/playerAttributesService';

interface UseSleeperPlayerResult {
  player: Player | null;
  stats: Record<string, number>;
  projections: Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

export const useSleeperPlayer = (
  playerId: string,
  season: string = '2024',
  week: number = 1
): UseSleeperPlayerResult => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [projections, setProjections] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch player, stats, and projections in parallel
        const [playerData, statsData, projectionsData] = await Promise.all([
          getPlayerById(playerId),
          getPlayerStats(playerId, season, week),
          getPlayerProjections(playerId, season, week)
        ]);

        if (!playerData) {
          throw new Error('Player not found');
        }

        // Calculate player scores (boom, bust, breakout)
        const playerWithScores = {
          ...playerData,
          ...calculatePlayerScores(playerData, statsData)
        };

        setPlayer(playerWithScores);
        setStats(statsData);
        setProjections(projectionsData);
      } catch (error) {
        console.error('Error fetching player data:', error);
        setError('Failed to load player data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId, season, week]);

  return { player, stats, projections, isLoading, error };
};