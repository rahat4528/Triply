import { calculateLineDistance, calculatePolygonArea } from '../data-processing/geodesic-measurement';

describe('Geodesic Measurement Tools (Distance & Surface Area)', () => {
  it('calculates line distance in meters accurately', () => {
    // 1 degree latitude step ~ 111,195m
    const coords: [number, number][] = [
      [0, 0],
      [0, 1],
    ];
    const dist = calculateLineDistance(coords);
    expect(dist).toBeGreaterThan(110000);
    expect(dist).toBeLessThan(112000);
  });

  it('calculates polygon surface area accurately', () => {
    // Small square polygon around equator (0.1 deg ~ 11.1km sides ~ 123 km^2 = 1.23e8 m^2)
    const ring: [number, number][] = [
      [0, 0],
      [0.1, 0],
      [0.1, 0.1],
      [0, 0.1],
      [0, 0],
    ];
    const area = calculatePolygonArea(ring);
    expect(area).toBeGreaterThan(1e8);
    expect(area).toBeLessThan(1.5e8);
  });
});
