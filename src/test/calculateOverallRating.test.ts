import { describe, it, expect } from 'vitest';
import { calculateOverallRating } from '../services/playerRatingService';
import { Player } from '../types/sleeper';

describe('calculateOverallRating', () => {
  it('should calculate QB rating correctly', () => {
    const player: Player = {
      player_id: '1',
      first_name: 'Test',
      last_name: 'QB',
      position: 'QB',
      team: 'TEST',
      age: 25,
      fantasy_positions: ['QB']
    };

    const attributes = {
      arm: 85,
      accuracy: 88,
      awareness: 82,
      agility: 75
    };

    const rating = calculateOverallRating(player, attributes);

    expect(rating).toBeGreaterThan(0);
    expect(rating).toBeLessThanOrEqual(99);
    expect(rating).toBeCloseTo(84, 1); // Expected rating based on weights
  });

  it('should calculate RB rating correctly', () => {
    const player: Player = {
      player_id: '2',
      first_name: 'Test',
      last_name: 'RB',
      position: 'RB',
      team: 'TEST',
      age: 24,
      fantasy_positions: ['RB']
    };

    const attributes = {
      speed: 90,
      agility: 88,
      power: 85,
      vision: 82
    };

    const rating = calculateOverallRating(player, attributes);

    expect(rating).toBeGreaterThan(0);
    expect(rating).toBeLessThanOrEqual(99);
    expect(rating).toBeCloseTo(87, 1); // Expected rating based on weights
  });

  it('should handle missing attributes gracefully', () => {
    const player: Player = {
      player_id: '3',
      first_name: 'Test',
      last_name: 'Player',
      position: 'WR',
      team: 'TEST',
      age: 26,
      fantasy_positions: ['WR']
    };

    const rating = calculateOverallRating(player, {});

    expect(rating).toBe(0); // Default when no attributes provided
  });
});