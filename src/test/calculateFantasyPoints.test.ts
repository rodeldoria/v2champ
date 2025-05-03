import { describe, it, expect } from 'vitest';
import { calculateFantasyPoints } from '../services/sleeperService';

describe('calculateFantasyPoints', () => {
  it('should calculate QB fantasy points correctly', () => {
    const stats = {
      pass_yd: 300,
      pass_td: 3,
      pass_int: 1,
      rush_yd: 20,
      rush_td: 1
    };

    const points = calculateFantasyPoints(stats, 'QB');
    
    // Expected points:
    // Pass yards: 300 * 0.04 = 12
    // Pass TDs: 3 * 4 = 12
    // INTs: 1 * -1 = -1
    // Rush yards: 20 * 0.1 = 2
    // Rush TDs: 1 * 6 = 6
    // Total: 31
    expect(points).toBe(31);
  });

  it('should calculate RB fantasy points correctly (PPR)', () => {
    const stats = {
      rush_yd: 100,
      rush_td: 1,
      rec: 5,
      rec_yd: 50,
      rec_td: 1
    };

    const points = calculateFantasyPoints(stats, 'RB');
    
    // Expected points:
    // Rush yards: 100 * 0.1 = 10
    // Rush TDs: 1 * 6 = 6
    // Receptions: 5 * 1 = 5 (PPR)
    // Rec yards: 50 * 0.1 = 5
    // Rec TDs: 1 * 6 = 6
    // Total: 32
    expect(points).toBe(32);
  });

  it('should handle missing stats gracefully', () => {
    const points = calculateFantasyPoints({}, 'WR');
    expect(points).toBe(0);
  });

  it('should calculate IDP fantasy points correctly', () => {
    const stats = {
      tackle_solo: 5,
      tackle_ast: 2,
      sack: 1,
      int: 1,
      pass_defended: 2
    };

    const points = calculateFantasyPoints(stats, 'LB');
    
    // Expected points:
    // Solo tackles: 5 * 1 = 5
    // Assisted tackles: 2 * 0.5 = 1
    // Sacks: 1 * 2 = 2
    // INTs: 1 * 2 = 2
    // Passes defended: 2 * 1 = 2
    // Total: 12
    expect(points).toBe(12);
  });
});