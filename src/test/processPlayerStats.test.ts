import { describe, it, expect } from 'vitest';
import { processPlayerStats } from '../services/stats';
import { Player } from '../types/sleeper';

describe('processPlayerStats', () => {
  it('should process QB stats correctly', () => {
    const player: Player = {
      player_id: '1',
      first_name: 'Test',
      last_name: 'QB',
      position: 'QB',
      team: 'TEST',
      age: 25,
      fantasy_positions: ['QB']
    };

    const stats = {
      pass_att: 500,
      pass_cmp: 350,
      pass_yd: 4000,
      pass_td: 35,
      pass_int: 10,
      rush_att: 50,
      rush_yd: 250,
      rush_td: 3
    };

    const result = processPlayerStats(player, stats);

    expect(result).toHaveProperty('stats');
    expect(result).toHaveProperty('attributes');
    expect(result).toHaveProperty('rating');
    expect(result.rating).toBeGreaterThan(0);
    expect(result.rating).toBeLessThanOrEqual(99);
  });

  it('should process RB stats correctly', () => {
    const player: Player = {
      player_id: '2',
      first_name: 'Test',
      last_name: 'RB',
      position: 'RB',
      team: 'TEST',
      age: 24,
      fantasy_positions: ['RB']
    };

    const stats = {
      rush_att: 250,
      rush_yd: 1200,
      rush_td: 10,
      rec: 40,
      rec_yd: 300,
      rec_td: 2
    };

    const result = processPlayerStats(player, stats);

    expect(result).toHaveProperty('stats');
    expect(result).toHaveProperty('attributes');
    expect(result.attributes).toHaveProperty('speed');
    expect(result.attributes).toHaveProperty('agility');
    expect(result.attributes).toHaveProperty('power');
    expect(result.attributes).toHaveProperty('vision');
  });

  it('should handle missing stats gracefully', () => {
    const player: Player = {
      player_id: '3',
      first_name: 'Test',
      last_name: 'Player',
      position: 'WR',
      team: 'TEST',
      age: 26,
      fantasy_positions: ['WR']
    };

    const result = processPlayerStats(player, {});

    expect(result).toHaveProperty('stats');
    expect(result).toHaveProperty('attributes');
    expect(result).toHaveProperty('rating');
    expect(result.rating).toBe(70); // Default rating
  });
});