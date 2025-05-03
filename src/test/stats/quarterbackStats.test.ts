import { describe, it, expect } from 'vitest';
import { QuarterbackProcessor } from '../../services/stats/quarterbackStats';

describe('QuarterbackProcessor', () => {
  const processor = new QuarterbackProcessor();

  it('should calculate QB attributes correctly', () => {
    const stats = {
      pass_att: 500,
      pass_cmp: 350,
      pass_air_yd: 4000,
      pass_cmp_40p: 0.18,
      pass_rtg: 95,
      rush_att: 50,
      rush_yd: 250
    };

    const attributes = processor.calculateAttributes(stats);

    expect(attributes.armStrength).toBe(100);
    expect(attributes.accuracy).toBe(70);
    expect(attributes.deepAccuracy).toBe(18);
    expect(attributes.awareness).toBe(95);
    expect(attributes.mobility).toBe(50);
  });

  it('should identify deep-ball specialists', () => {
    const stats = {
      pass_att: 500,
      pass_cmp: 350,
      pass_air_yd: 4000,
      pass_cmp_40p: 0.19, // Above 0.18 threshold
      pass_rtg: 95,
      rush_att: 50,
      rush_yd: 250
    };

    const attributes = processor.calculateAttributes(stats);
    expect(attributes.deepAccuracy).toBeGreaterThan(18);
  });

  it('should handle missing stats gracefully', () => {
    const attributes = processor.calculateAttributes({});

    expect(attributes.armStrength).toBe(0);
    expect(attributes.accuracy).toBe(0);
    expect(attributes.deepAccuracy).toBe(0);
    expect(attributes.awareness).toBe(0);
    expect(attributes.mobility).toBe(0);
  });

  it('should calculate fantasy points correctly', () => {
    const stats = {
      pass_yd: 300,
      pass_td: 3,
      pass_int: 1,
      rush_yd: 50,
      rush_td: 1
    };

    const processed = processor.processStats(stats);
    
    // 300 * 0.04 + 3 * 4 - 1 + 50 * 0.1 + 1 * 6 = 12 + 12 - 1 + 5 + 6 = 34
    expect(processed.fantasyPoints).toBe(34);
  });
});