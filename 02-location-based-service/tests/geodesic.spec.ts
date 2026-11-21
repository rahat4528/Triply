import { calculateGeodesicDistance, calculateBearing, isPointInCircle } from '../geolocation/geodesic';

describe('Geodesic Distance & Spatial Containment', () => {
  it('calculates accurate distance between London landmarks in meters', () => {
    // Waterloo Station (51.5032, -0.1123) to London Eye (51.5033, -0.1195) ~ 500m
    const distance = calculateGeodesicDistance(51.5032, -0.1123, 51.5033, -0.1195);
    expect(distance).toBeGreaterThan(450);
    expect(distance).toBeLessThan(550);
  });

  it('calculates global distances correctly across poles and equator', () => {
    // Distance from North Pole (90, 0) to Equator (0, 0) ~ 10,000 km
    const distance = calculateGeodesicDistance(90, 0, 0, 0);
    expect(distance).toBeGreaterThan(9950000);
    expect(distance).toBeLessThan(10050000);
  });

  it('calculates compass bearings accurately', () => {
    // Heading directly North
    expect(calculateBearing(0, 0, 10, 0)).toBe(0);
    // Heading directly East
    expect(calculateBearing(0, 0, 0, 10)).toBe(90);
    // Heading directly South
    expect(calculateBearing(10, 0, 0, 0)).toBe(180);
    // Heading directly West
    expect(calculateBearing(0, 10, 0, 0)).toBe(270);
  });

  it('evaluates circular boundary containment correctly', () => {
    const centerLat = 51.5045;
    const centerLon = -0.1145;
    const radiusMeters = 500;

    // Inside point (100m away)
    expect(isPointInCircle(51.5048, -0.1145, centerLat, centerLon, radiusMeters)).toBe(true);
    // Outside point (1500m away)
    expect(isPointInCircle(51.5200, -0.1145, centerLat, centerLon, radiusMeters)).toBe(false);
  });
});
