import { useState, useEffect } from 'react';
import { Player } from '../types/sleeper';
import { fetchPlayerStats } from '../api/sleeperApi';
import { handleError, ErrorType } from '../services/errorHandling';

interface UsePlayerStatsResult {
  stats: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  fantasyOff: number;
  fantasyDef: number | null;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const statsCache = new Map<string, { data: Record<string, number>; timestamp: number }>();

export const usePlayerStats = (
  player: Player | null,
  season: string = '2024',
  week: number = 1
): UsePlayerStatsResult => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fantasyOff, setFantasyOff] = useState(0);
  const [fantasyDef, setFantasyDef] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!player?.player_id) {
        setStats({});
        setError(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check cache
        const cacheKey = `${player.player_id}:${season}:${week}`;
        const cached = statsCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          setStats(cached.data);
          calculateFantasyPoints(cached.data);
          setIsLoading(false);
          return;
        }

        // Try to fetch from FastAPI first if available
        const apiUrl = import.meta.env.VITE_API_URL;
        if (apiUrl) {
          try {
            const response = await fetch(`${apiUrl}/api/players/${player.player_id}/stats?season=${season}&week=${week}`);
            if (response.ok) {
              const data = await response.json();
              
              // Cache the result
              statsCache.set(cacheKey, {
                data,
                timestamp: Date.now()
              });

              setStats(data);
              calculateFantasyPoints(data);
              setIsLoading(false);
              return;
            }
          } catch (apiError) {
            console.warn('Error fetching from FastAPI, falling back to Sleeper API:', apiError);
          }
        }

        // Fetch from Sleeper API with retries
        const playerStats = await fetchWithRetry(async () => {
          return await fetchPlayerStats(player.player_id, season, week);
        }, 3);
        
        // Cache the result
        statsCache.set(cacheKey, {
          data: playerStats,
          timestamp: Date.now()
        });

        setStats(playerStats);
        calculateFantasyPoints(playerStats);
      } catch (err) {
        const errorMessage = handleError(err, ErrorType.API);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [player?.player_id, season, week]);

  const fetchWithRetry = async <T>(fn: () => Promise<T>, retries: number): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(fn, retries - 1);
      }
      throw error;
    }
  };

  const calculateFantasyPoints = (stats: Record<string, number>) => {
    // Calculate offensive points
    const offPoints = (
      (stats.pass_yd || 0) * 0.04 +
      (stats.pass_td || 0) * 4 +
      (stats.pass_int || 0) * -1 +
      (stats.rush_yd || 0) * 0.1 +
      (stats.rush_td || 0) * 6 +
      (stats.rec || 0) * 1 + // PPR
      (stats.rec_yd || 0) * 0.1 +
      (stats.rec_td || 0) * 6
    );
    setFantasyOff(offPoints);

    // Calculate defensive points if applicable
    if (['DEF', 'DL', 'LB', 'DB'].includes(player?.position || '')) {
      const defPoints = (
        (stats.sack || 0) * 1 +
        (stats.int || 0) * 2 +
        (stats.fum_rec || 0) * 2 +
        (stats.safety || 0) * 2 +
        (stats.td || 0) * 6 +
        (stats.pts_allowed || 0) * -0.1
      );
      setFantasyDef(defPoints);
    } else {
      setFantasyDef(null);
    }
  };

  return { stats, isLoading, error, fantasyOff, fantasyDef };
};