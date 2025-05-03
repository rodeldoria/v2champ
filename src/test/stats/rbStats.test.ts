import { describe, it, expect } from 'vitest';
import { RunningBackProcessor } from '../../services/stats/runningBackStats';

describe('RunningBackProcessor', () => {
  const processor = new RunningBackProcessor();

  it('should process RB stats correctly', () => {
    const stats = {
      rush_att: 250,
      rush_yd: 1200,
      rush_td: 10,
      rec: 40,
      rec_yd: 300,
      rec_td: 2,
      targets: 50,
      snap_pct: 75
    };

    const result = processor.processStats(stats);

    expect(result.rushing.attempts).toBe(250);
    expect(result.rushing.yards).toBe(1200);
    expect(result.rushing.touchdowns).toBe(10);
    expect(result.rushing.yardsPerCarry).toBe(4.8);
    expect(result.receiving.receptions).toBe(40);
    expect(result.receiving.yards).toBe(300);
    expect(result.snapPercentage).toBe(75);
  });

  it('should calculate attributes correctly', () => {
    const stats = {
      rush_att: 250,
      rush_yd: 1200,
      rush_td: 10,
      rec: 40,
      rec_yd: 300,
      rec_td: 2,
      targets: 50,
      snap_pct: 75
    };

    const attributes = processor.calculateAttributes(stats);

    expect(attributes.speed).toBeGreaterThan(0);
    expect(attributes.speed).toBeLessThanOrEqual(99);
    expect(attributes.agility).toBeGreaterThan(0);
    expect(attributes.agility).toBeLessThanOrEqual(99);
    expect(attributes.power).toBeGreaterThan(0);
    expect(attributes.power).toBeLessThanOrEqual(99);
    expect(attributes.vision).toBeGreaterThan(0);
    expect(attributes.vision).toBeLessThanOrEqual(99);
  });

  it('should handle missing stats gracefully', () => {
    const result = processor.processStats({});

    expect(result.rushing.attempts).toBe(0);
    expect(result.rushing.yards).toBe(0);
    expect(result.rushing.touchdowns).toBe(0);
    expect(result.rushing.yardsPerCarry).toBe(0);
    expect(result.receiving.receptions).toBe(0);
    expect(result.receiving.yards).toBe(0);
    expect(result.snapPercentage).toBe(0);
  });
});