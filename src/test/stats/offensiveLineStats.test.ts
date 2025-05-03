import { describe, it, expect } from 'vitest';
import { OffensiveLineProcessor } from '../../services/stats/offensiveLineStats';

describe('OffensiveLineProcessor', () => {
  const processor = new OffensiveLineProcessor();

  it('should process offensive line stats correctly', () => {
    const stats = {
      sacks_allowed: 20,
      pressures_allowed: 50,
      run_block_win_rate: 85,
      pass_block_win_rate: 80,
      false_starts: 5,
      holdings: 8,
      snap_pct: 95
    };

    const result = processor.processStats(stats);

    expect(result.blocking.sacks_allowed).toBe(20);
    expect(result.blocking.pressures_allowed).toBe(50);
    expect(result.blocking.run_block_win_rate).toBe(85);
    expect(result.blocking.pass_block_win_rate).toBe(80);
    expect(result.penalties.false_starts).toBe(5);
    expect(result.penalties.holdings).toBe(8);
    expect(result.penalties.total).toBe(13);
    expect(result.snapPercentage).toBe(95);
  });

  it('should calculate attributes correctly', () => {
    const stats = {
      sacks_allowed: 20,
      pressures_allowed: 50,
      run_block_win_rate: 85,
      pass_block_win_rate: 80,
      false_starts: 5,
      holdings: 8,
      snap_pct: 95
    };

    const attributes = processor.calculateAttributes(stats);

    expect(attributes.runBlocking).toBeGreaterThan(0);
    expect(attributes.runBlocking).toBeLessThanOrEqual(99);
    expect(attributes.passBlocking).toBeGreaterThan(0);
    expect(attributes.passBlocking).toBeLessThanOrEqual(99);
    expect(attributes.technique).toBeGreaterThan(0);
    expect(attributes.technique).toBeLessThanOrEqual(99);
    expect(attributes.durability).toBeGreaterThan(0);
    expect(attributes.durability).toBeLessThanOrEqual(99);
  });

  it('should handle missing stats gracefully', () => {
    const result = processor.processStats({});

    expect(result.blocking.sacks_allowed).toBe(0);
    expect(result.blocking.pressures_allowed).toBe(0);
    expect(result.blocking.run_block_win_rate).toBe(75); // Default win rate
    expect(result.blocking.pass_block_win_rate).toBe(75); // Default win rate
    expect(result.penalties.total).toBe(0);
    expect(result.snapPercentage).toBe(0);
  });

  it('should not calculate fantasy points for offensive line', () => {
    const result = processor.processStats({});
    expect(result.fantasyPoints).toBe(0);
  });
});