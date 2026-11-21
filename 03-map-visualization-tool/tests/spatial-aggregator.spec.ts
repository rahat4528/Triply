import { aggregateToGrid } from '../visualization/spatial-aggregator';

describe('Spatial Grid Aggregation', () => {
  it('aggregates points into spatial grid bins with counts and metric averages', () => {
    const points = [
      { latitude: 51.501, longitude: -0.111, value: 20 },
      { latitude: 51.503, longitude: -0.113, value: 40 },
      { latitude: 51.600, longitude: -0.111, value: 10 },
    ];

    const bins = aggregateToGrid(points, 0.05);
    expect(bins.length).toBeGreaterThan(0);

    const firstBin = bins.find((b) => b.count === 2);
    expect(firstBin).toBeDefined();
    expect(firstBin?.metricAverage).toBe(30); // (20 + 40) / 2
  });
});
