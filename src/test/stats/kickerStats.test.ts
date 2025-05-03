import { describe, it, expect } from 'vitest';
import { KickerProcessor } from '../../services/stats/kickerStats';

describe('KickerProcessor', () => {
  const processor = new KickerProcessor();

  it('should process kicker stats correctly', () => {
    const stats = {
      fg_att: 35,
      fg_made: 32,
      fg_made_50_plus: 5,
      fg_long: 55,
      xp_att: 40,
      xp_made: 38,
      ko: 80,
      ko_touchback: 65
    };

    const result = processor.processStats(stats);

    expect(result.fieldGoals.attempts).toBe(35);
    expect(result.fieldGoals.made).toBe(32);
    expect(result.fieldGoals.percentage).toBeCloseTo(91.43, 2);
    expect(result.fieldGoals.made50Plus).toBe(5);
    expect(result.fieldGoals.long).toBe(55);
    expect(result.extraPoints.attempts).toBe(40);
    expect(result.extraPoints.made).toBe(38);
    expect(result.snapPercentage).toBe(100); // Kickers always 100%
  });

  it('should calculate attributes correctly', () => {
    const stats = {
      fg_att: 35,
      fg_made: 32,
      fg_made_50_plus: 5,
      fg_long: 55,
      xp_att: 40,
      xp_made: 38
    };

    const attributes = processor.calculateAttributes(stats);

    expect(attributes.accuracy).toBeGreaterThan(0);
    expect(attributes.accuracy).toBeLessThanOrEqual(99);
    expect(attributes.power).toBeGreaterThan(0);
    expect(attributes.power).toBeLessThanOrEqual(99);
  });

  it('should handle missing stats gracefully', () => {
    const result = processor.processStats({});

    expect(result.fieldGoals.attempts).toBe(0);
    expect(result.fieldGoals.made).toBe(0);
    expect(result.fieldGoals.percentage).toBe(0);
    expect(result.extraPoints.attempts).toBe(0);
    expect(result.extraPoints.made).toBe(0);
    expect(result.snapPercentage).toBe(100);
  });

  it('should calculate fantasy points correctly', () => {
    const stats = {
      fg_made: 3,
      xp_made: 2
    };

    const result = processor.processStats(stats);
    // 3 FG * 3 points + 2 XP * 1 point = 11 points
    expect(result.fantasyPoints).toBe(11);
  });
});