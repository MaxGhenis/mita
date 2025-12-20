/**
 * Tests for scaleUtils - scale functions used in scatter plot
 */

import { createXScale } from './scaleUtils';

describe('createXScale', () => {
  const INNER_WIDTH = 610; // 700 - 60 (left margin) - 30 (right margin)

  it('maps domain [-50, 50] to range [0, innerWidth]', () => {
    const xScale = createXScale(INNER_WIDTH);

    expect(xScale(-50)).toBe(0);
    expect(xScale(0)).toBe(INNER_WIDTH / 2);
    expect(xScale(50)).toBe(INNER_WIDTH);
  });

  it('positions mita districts (positive scatterX) on right half', () => {
    const xScale = createXScale(INNER_WIDTH);

    // Mita district 25km inside boundary
    const scatterX = 25;
    const cx = xScale(scatterX);

    expect(cx).toBeGreaterThan(INNER_WIDTH / 2);
    expect(cx).toBeLessThan(INNER_WIDTH);
  });

  it('positions non-mita districts (negative scatterX) on left half', () => {
    const xScale = createXScale(INNER_WIDTH);

    // Non-mita district 25km outside boundary
    const scatterX = -25;
    const cx = xScale(scatterX);

    expect(cx).toBeGreaterThan(0);
    expect(cx).toBeLessThan(INNER_WIDTH / 2);
  });

  describe('clamping behavior - CRITICAL for dot positioning', () => {
    it('clamps values below domain minimum (-50) to 0', () => {
      const xScale = createXScale(INNER_WIDTH);

      // If a district has distance > 50km outside boundary, scatterX would be < -50
      // This should be clamped to 0, not return a negative pixel value
      const scatterX = -60;
      const cx = xScale(scatterX);

      expect(cx).toBe(0);
      expect(cx).toBeGreaterThanOrEqual(0);
    });

    it('clamps values above domain maximum (50) to innerWidth', () => {
      const xScale = createXScale(INNER_WIDTH);

      // If a district has distance > 50km inside boundary, scatterX would be > 50
      // This should be clamped to innerWidth, not exceed it
      const scatterX = 60;
      const cx = xScale(scatterX);

      expect(cx).toBe(INNER_WIDTH);
      expect(cx).toBeLessThanOrEqual(INNER_WIDTH);
    });

    it('keeps values within plot bounds for ALL real data distances', () => {
      const xScale = createXScale(INNER_WIDTH);

      // Test with actual data range from mitaData.json
      // Max positive: ~49.86 (mita district)
      // Max negative: ~-49.86 (non-mita district after flip)
      const testDistances = [-49.86, -30, -10, 0, 10, 30, 49.86];

      testDistances.forEach(distance => {
        const cx = xScale(distance);
        expect(cx).toBeGreaterThanOrEqual(0);
        expect(cx).toBeLessThanOrEqual(INNER_WIDTH);
      });
    });

    it('ALL positions must be within [0, innerWidth] - no exceptions', () => {
      const xScale = createXScale(INNER_WIDTH);

      // Test extreme values that might occur during data processing
      // or due to floating point errors
      const extremeValues = [-100, -75, -51, -50.01, 50.01, 51, 75, 100];

      extremeValues.forEach(value => {
        const cx = xScale(value);
        expect(cx).toBeGreaterThanOrEqual(0);
        expect(cx).toBeLessThanOrEqual(INNER_WIDTH);
      });
    });
  });
});
