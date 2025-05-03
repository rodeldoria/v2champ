import { describe, it, expect } from 'vitest';
import { WideReceiverProcessor } from '../../services/stats/wideReceiverStats';

describe('WideReceiverProcessor', () => {
  const processor = new WideReceiverProcessor();

  it('should process WR stats correctly', () => {
    const stats = {
      targets: 150,
      rec: 100,
      rec_yd: 1400,
      rec_td: 12,
      yac: 500,
      contested_catches: 15,
      snap_pct: 85
    };

    const result = processor.processStats(stats);

    expect(result.receiving.targets).toBe(150);
    expect(result.receiving.receptions).toBe(100);
    expect(result.receiving.yards).toBe(1400);
    expect(result.receiving.touchdowns).toBe(12);
    expect(result.receiving.yardsPerReception).toBe(14);
    expect(result.receiving.catchRate).toBe(66.67);
    expect(result.snapPercentage).toBe(85);
  });

  it('should calculate attributes correctly', () => {
    const stats = {
      targets: 150,
      rec: 100,
      rec_yd: 1400,
      rec_td: 12,
      yac: 500,
      contested_catches: 15,
      snap_pct: 85
    };

    const attributes = processor.calculateAttributes(stats);

    expect(attributes.speed).toBeGreaterThan(0);
    expect(attributes.speed).toBeLessThanOrEqual(99);
    expect(attributes.hands).toBeGreaterThan(0);
    expect(attributes.hands).toBeLessThanOrEqual(99);
    expect(attributes.route).toBeGreaterThan(0);
    expect(attributes.route).toBeLessThanOrEqual(99);
    expect(attributes.separation).toBeGreaterThan(0);
    expect(attributes.separation).toBeLessThanOrEqual(99);
  });

  it('should handle missing stats gracefully', () => {
    const result = processor.processStats({});

    expect(result.receiving.targets).toBe(0);
    expect(result.receiving.receptions).toBe(0);
    expect(result.receiving.yards).toBe(0);
    expect(result.receiving.touchdowns).toBe(0);
    expect(result.receiving.yardsPerReception).toBe(0);
    expect(result.receiving.catchRate).toBe(0);
    expect(result.snapPercentage).toBe(0);
  });
});