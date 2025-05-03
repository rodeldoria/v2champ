import { describe, it, expect } from 'vitest';
import { DefensiveProcessor } from '../../services/stats/defensiveStats';

describe('DefensiveProcessor', () => {
  const processor = new DefensiveProcessor();

  it('should process defensive stats correctly', () => {
    const stats = {
      tackle_solo: 75,
      tackle_ast: 25,
      tackle_loss: 12,
      sack: 8,
      qb_hit: 15,
      int: 3,
      pass_defended: 10,
      forced_fumble: 2,
      fumble_recovery: 1,
      snap_pct: 90
    };

    const result = processor.processStats(stats);

    expect(result.tackles.solo).toBe(75);
    expect(result.tackles.assisted).toBe(25);
    expect(result.tackles.total).toBe(100);
    expect(result.tackles.forLoss).toBe(12);
    expect(result.pressure.sacks).toBe(8);
    expect(result.coverage.interceptions).toBe(3);
    expect(result.snapPercentage).toBe(90);
  });

  it('should calculate attributes correctly', () => {
    const stats = {
      tackle_solo: 75,
      tackle_ast: 25,
      tackle_loss: 12,
      sack: 8,
      qb_hit: 15,
      int: 3,
      pass_defended: 10,
      forced_fumble: 2,
      fumble_recovery: 1,
      snap_pct: 90
    };

    const attributes = processor.calculateAttributes(stats);

    expect(attributes.tackling).toBeGreaterThan(0);
    expect(attributes.tackling).toBeLessThanOrEqual(99);
    expect(attributes.coverage).toBeGreaterThan(0);
    expect(attributes.coverage).toBeLessThanOrEqual(99);
    expect(attributes.passRush).toBeGreaterThan(0);
    expect(attributes.passRush).toBeLessThanOrEqual(99);
    expect(attributes.playmaking).toBeGreaterThan(0);
    expect(attributes.playmaking).toBeLessThanOrEqual(99);
  });

  it('should handle missing stats gracefully', () => {
    const result = processor.processStats({});

    expect(result.tackles.solo).toBe(0);
    expect(result.tackles.assisted).toBe(0);
    expect(result.tackles.total).toBe(0);
    expect(result.tackles.forLoss).toBe(0);
    expect(result.pressure.sacks).toBe(0);
    expect(result.coverage.interceptions).toBe(0);
    expect(result.snapPercentage).toBe(0);
  });
});