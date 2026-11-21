import {
  classifyEqualInterval,
  classifyQuantile,
  classifyNaturalBreaks,
} from '../data-processing/classification';

describe('Statistical Classification Methods (Choropleths)', () => {
  const sampleValues = [2, 5, 8, 12, 19, 25, 30, 45, 60, 95];

  it('computes Equal Interval classification breaks correctly', () => {
    const breaks = classifyEqualInterval(sampleValues, 4);
    expect(breaks.length).toBe(5);
    expect(breaks[0]).toBe(2);
    expect(breaks[breaks.length - 1]).toBe(95);

    // Step should be (95 - 2) / 4 = 23.25
    expect(breaks[1] - breaks[0]).toBeCloseTo(23.25, 1);
  });

  it('computes Quantile classification breaks correctly', () => {
    const breaks = classifyQuantile(sampleValues, 4);
    expect(breaks.length).toBeGreaterThanOrEqual(4);
    expect(breaks[0]).toBe(2);
    expect(breaks[breaks.length - 1]).toBe(95);
  });

  it('computes Natural Breaks (Jenks) classification correctly', () => {
    const breaks = classifyNaturalBreaks(sampleValues, 3);
    expect(breaks.length).toBe(4);
    expect(breaks[0]).toBe(2);
    expect(breaks[breaks.length - 1]).toBe(95);
  });
});
