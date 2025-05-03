import { PlayersDataSource } from './playersDataSource';
import { Player } from '../types/sleeper';

const BASE_URL = 'https://api.sleeper.app/v1';
const BATCH_SIZE = 3;
const BATCH_DELAY = 2000;

export class HttpPlayersDataSource implements PlayersDataSource {
  async fetchAllPlayers(): Promise<Record<string, Player>> {
    const response = await fetch(`${BASE_URL}/players/nfl`);
    if (!response.ok) throw new Error('Failed to fetch players');
    return response.json();
  }

  async fetchPlayerById(id: string): Promise<Player | null> {
    const players = await this.fetchAllPlayers();
    return players[id] || null;
  }

  async fetchPlayersByIds(ids: string[]): Promise<Record<string, Player>> {
    const players = await this.fetchAllPlayers();
    return Object.fromEntries(
      ids.map(id => [id, players[id]]).filter(([_, player]) => player)
    );
  }

  async fetchPlayerStats(
    playerId: string,
    season: string,
    week: number
  ): Promise<Record<string, number>> {
    const response = await fetch(
      `${BASE_URL}/stats/nfl/regular/${season}/${week}?player_id=${playerId}`
    );
    if (!response.ok) throw new Error('Failed to fetch player stats');
    const data = await response.json();
    return data[playerId] || {};
  }

  async fetchPlayerStatsBatch(
    playerIds: string[],
    season: string,
    week: number
  ): Promise<Record<string, Record<string, number>>> {
    const results: Record<string, Record<string, number>> = {};
    
    // Process in batches
    for (let i = 0; i < playerIds.length; i += BATCH_SIZE) {
      const batch = playerIds.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(id => this.fetchPlayerStats(id, season, week));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        batch.forEach((id, index) => {
          if (Object.keys(batchResults[index]).length > 0) {
            results[id] = batchResults[index];
          }
        });
      } catch (error) {
        console.error(`Error processing batch starting at index ${i}:`, error);
      }
      
      if (i + BATCH_SIZE < playerIds.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    return results;
  }

  async fetchPlayerProjections(
    playerId: string,
    season: string,
    week: number
  ): Promise<Record<string, number>> {
    const response = await fetch(
      `${BASE_URL}/projections/nfl/regular/${season}/${week}?player_id=${playerId}`
    );
    if (!response.ok) throw new Error('Failed to fetch player projections');
    const data = await response.json();
    return data[playerId] || {};
  }

  async fetchPlayerCareerStats(
    playerId: string,
    seasons: string[] = ['2024', '2023', '2022', '2021', '2020']
  ): Promise<Record<string, Record<string, number>>> {
    const careerStats: Record<string, Record<string, number>> = {};
    
    await Promise.all(
      seasons.map(async (season) => {
        try {
          const weekStats = await Promise.all(
            Array.from({ length: 18 }, (_, i) => i + 1).map(week =>
              this.fetchPlayerStats(playerId, season, week)
            )
          );
          
          const seasonTotals = weekStats.reduce((totals, weekStat) => {
            Object.entries(weekStat).forEach(([key, value]) => {
              if (typeof value === 'number') {
                totals[key] = (totals[key] || 0) + value;
              }
            });
            return totals;
          }, {} as Record<string, number>);
          
          if (Object.keys(seasonTotals).length > 0) {
            careerStats[season] = seasonTotals;
          }
        } catch (error) {
          console.error(`Error fetching stats for season ${season}:`, error);
        }
      })
    );
    
    return careerStats;
  }

  async searchPlayers(query: string): Promise<Player[]> {
    const players = await this.fetchAllPlayers();
    const searchTerm = query.toLowerCase();
    
    return Object.values(players).filter(player => 
      player.first_name?.toLowerCase().includes(searchTerm) ||
      player.last_name?.toLowerCase().includes(searchTerm) ||
      player.team?.toLowerCase().includes(searchTerm)
    );
  }

  async filterPlayersByPosition(position: string): Promise<Player[]> {
    const players = await this.fetchAllPlayers();
    
    if (position === 'ALL') return Object.values(players);
    if (position === 'FLEX') {
      return Object.values(players).filter(p => 
        ['RB', 'WR', 'TE'].includes(p.position || '')
      );
    }
    
    return Object.values(players).filter(p => p.position === position);
  }

  async fetchTrendingPlayers(
    type: 'add' | 'drop' = 'add',
    lookback: number = 24,
    limit: number = 25
  ): Promise<string[]> {
    const response = await fetch(
      `${BASE_URL}/players/nfl/trending/${type}?lookback_hours=${lookback}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch trending players');
    const data = await response.json();
    return data.map((p: any) => p.player_id);
  }
}

// Export a singleton instance
export const httpPlayersSource = new HttpPlayersDataSource();