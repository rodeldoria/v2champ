import { describe, it, expect } from 'vitest';
import { QuarterbackProcessor } from '../../services/stats/quarterbackStats';

describe('QuarterbackProcessor', () => {
  const processor = new QuarterbackProcessor();

  it('should process QB stats correctly', () => {
    const stats = {
      pass_att: 500,
      pass_cmp: 350,
      pass_yd: 4000,
      pass_td: 35,
      pass_int: 10,
      rush_att: 50,
      rush_yd: 250,
      rush_td: 3,
      snap_pct: 95
    };

    const result = processor.processStats(stats);

    expect(result.passing.attempts).toBe(500);
    expect(result.passing.completions).toBe(350);
    expect(result.passing.yards).toBe(4000);
    expect(result.passing.touchdowns).toBe(35);
    expect(result.efficiency.completionPercentage).toBe(70);
    expect(result.efficiency.yardsPerAttempt).toBe(8);
    expect(result.snapPercentage).toBe(95);
  });

  it('should calculate attributes correctly', () => {
    const stats = {
      pass_att: 500,
      pass_cmp: 350,
      pass_yd: 4000,
      pass_td: 35,
      pass_int: 10,
      rush_att: 50,
      rush_yd: 250,
      rush_td: 3,
      snap_pct: 95
    };

    const attributes = processor.calculateAttributes(stats);

    expect(attributes.arm).toBeGreaterThan(0);
    expect(attributes.arm).toBeLessThanOrEqual(99);
    expect(attributes.accuracy).toBeGreaterThan(0);
    expect(attributes.accuracy).toBeLessThanOrEqual(99);
    expect(attributes.awareness).toBeGreaterThan(0);
    expect(attributes.awareness).toBeLessThanOrEqual(99);
    expect(attributes.agility).toBeGreaterThan(0);
    expect(attributes.agility).toBeLessThanOrEqual(99);
  });

  it('should handle missing stats gracefully', () => {
    const result = processor.processStats({});

    expect(result.passing.attempts).toBe(0);
    expect(result.passing.completions).toBe(0);
    expect(result.passing.yards).toBe(0);
    expect(result.passing.touchdowns).toBe(0);
    expect(result.efficiency.completionPercentage).toBe(0);
    expect(result.efficiency.yardsPerAttempt).toBe(0);
    expect(result.snapPercentage).toBe(0);
  });
});