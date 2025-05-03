import { describe, it, expect } from 'vitest';
import { TightEndProcessor } from '../../services/stats/tightEndStats';

describe('TightEndProcessor', () => {
  const processor = new TightEndProcessor();

  it('should process tight end stats correctly', () => {
    const stats = {
      targets: 80,
      rec: 60,
      rec_yd: 800,
      rec_td: 8,
      run_block_grade: 85,
      pass_block_grade: 80,
      snaps: 800,
      blocking_snaps: 400,
      rz_targets: 15,
      rz_receptions: 10
    };

    const result = processor.processStats(stats);

    expect(result.receiving.targets).toBe(80);
    expect(result.receiving.receptions).toBe(60);
    expect(result.receiving.yards).toBe(800);
    expect(result.receiving.touchdowns).toBe(8);
    expect(result.receiving.catchRate).toBe(75);
    expect(result.blocking.runBlockGrade).toBe(85);
    expect(result.blocking.passBlockGrade).toBe(80);
  });

  it('should calculate attributes correctly', () => {
    const stats = {
      targets: 80,
      rec: 60,
      rec_yd: 800,
      rec_td: 8,
      run_block_grade: 85,
      pass_block_grade: 80
    };

    const attributes = processor.calculateAttributes(stats);

    expect(attributes.speed).toBeGreaterThan(0);
    expect(attributes.speed).toBeLessThanOrEqual(99);
    expect(attributes.hands).toBeGreaterThan(0);
    expect(attributes.hands).toBeLessThanOrEqual(99);
    expect(attributes.route).toBeGreaterThan(0);
    expect(attributes.route).toBeLessThanOrEqual(99);
    expect(attributes.blocking).toBeGreaterThan(0);
    expect(attributes.blocking).toBeLessThanOrEqual(99);
  });

  it('should handle missing stats gracefully', () => {
    const result = processor.processStats({});

    expect(result.receiving.targets).toBe(0);
    expect(result.receiving.receptions).toBe(0);
    expect(result.receiving.yards).toBe(0);
    expect(result.receiving.touchdowns).toBe(0);
    expect(result.blocking.runBlockGrade).toBe(70); // Default grade
    expect(result.blocking.passBlockGrade).toBe(70); // Default grade
  });

  it('should calculate fantasy points correctly', () => {
    const stats = {
      rec: 5,
      rec_yd: 80,
      rec_td: 1
    };

    const result = processor.processStats(stats);
    // 5 rec * 1 + 80 yards * 0.1 + 1 TD * 6 = 13 points
    expect(result.fantasyPoints).toBe(13);
  });
});