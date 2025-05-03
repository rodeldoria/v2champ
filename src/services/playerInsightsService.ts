import { Player } from '../types/sleeper';
import { supabase } from '../lib/supabase';
import { generatePlayerInsights, PlayerInsight, batchProcessPlayerInsights, checkOllamaAvailability } from './aiInsightsService';

/**
 * Get insights for a player from the database or generate them if not available
 * @param player The player to get insights for
 * @param stats Player statistics
 * @returns Player insights
 */
export const getPlayerInsights = async (
  player: Player,
  stats: Record<string, number> = {}
): Promise<PlayerInsight> => {
  if (!player) {
    throw new Error('Player data is required');
  }

  try {
    // Check if Supabase URL and key are valid
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // If Supabase credentials are invalid, use fallback insights
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-') || 
        supabaseKey.includes('your-')) {
      console.warn('Invalid Supabase configuration, using fallback insights');
      return await generatePlayerInsights(player, stats);
    }

    // Check if insights exist in the database
    try {
      const { data, error } = await supabase
        .from('player_insights')
        .select('insights, created_at')
        .eq('player_id', player.player_id)
        .single();

      // If insights exist and are less than 24 hours old, return them
      if (!error && data) {
        const createdAt = new Date(data.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceCreation < 24) {
          return {
            ...data.insights,
            lastUpdated: data.created_at
          };
        }
      }
    } catch (dbError) {
      console.warn('Error checking database for insights, will generate new ones:', dbError);
    }

    // Generate new insights
    return await generatePlayerInsights(player, stats);
  } catch (error) {
    console.error('Error getting player insights:', error);
    // Use fallback insights generation that doesn't require Supabase
    return await generatePlayerInsights(player, stats);
  }
};

/**
 * Process insights for all players in the database
 * This can be run as a scheduled job
 */
export const processAllPlayerInsights = async () => {
  try {
    // Check if Ollama is available
    const ollamaAvailable = await checkOllamaAvailability();
    if (!ollamaAvailable) {
      throw new Error('Ollama is not available. Please make sure it is running on your machine.');
    }

    // Check if Supabase URL and key are valid
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-') || 
        supabaseKey.includes('your-')) {
      throw new Error('Invalid Supabase configuration. Please check your environment variables.');
    }

    // Get all players from the database
    const { data: players, error } = await supabase
      .from('cached_players')
      .select('*');

    if (error) throw error;
    if (!players || players.length === 0) {
      return { processed: 0, errors: 0, message: 'No players found in the database' };
    }

    // Convert to Player type
    const playerObjects = players.map(p => ({
      player_id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      team: p.team,
      position: p.position,
      age: p.age
    })) as Player[];

    // Process players in batches
    return await batchProcessPlayerInsights(playerObjects);
  } catch (error) {
    console.error('Error processing all player insights:', error);
    throw error;
  }
};

/**
 * Get the most viewed players with their insights
 * @param limit Number of players to return
 */
export const getMostViewedPlayersWithInsights = async (limit: number = 10): Promise<any[]> => {
  try {
    // Check if Supabase URL and key are valid
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-') || 
        supabaseKey.includes('your-')) {
      console.warn('Invalid Supabase configuration');
      return [];
    }

    // Get most viewed players
    const { data: playerStats, error } = await supabase
      .from('player_stats')
      .select('player_id, count')
      .order('count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!playerStats || playerStats.length === 0) {
      return [];
    }

    // Get player details and insights
    const playerInsights = await Promise.all(
      playerStats.map(async (stat) => {
        try {
          // Get player details
          const { data: player } = await supabase
            .from('cached_players')
            .select('*')
            .eq('id', stat.player_id)
            .single();

          // Get player insights
          const { data: insight } = await supabase
            .from('player_insights')
            .select('insights')
            .eq('player_id', stat.player_id)
            .single();

          return {
            player: player,
            insights: insight?.insights || null,
            views: stat.count
          };
        } catch (error) {
          console.error(`Error fetching details for player ${stat.player_id}:`, error);
          return null;
        }
      })
    );

    return playerInsights.filter(Boolean);
  } catch (error) {
    console.error('Error getting most viewed players with insights:', error);
    return [];
  }
};