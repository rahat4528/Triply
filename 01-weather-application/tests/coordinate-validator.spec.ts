import { validateCoordinates } from '../integrations/coordinate-validator';

describe('Geographic Coordinate Validation & Swap Detection', () => {
  it('accepts valid coordinates worldwide', () => {
    const london = validateCoordinates(51.5074, -0.1278);
    expect(london.isValid).toBe(true);
    expect(london.latitude).toBeCloseTo(51.5074);
    expect(london.longitude).toBeCloseTo(-0.1278);
    expect(london.isPotentialSwap).toBe(false);

    const equatorPole = validateCoordinates(-90, 180);
    expect(equatorPole.isValid).toBe(true);
  });

  it('rejects latitude out of bounds [-90, 90]', () => {
    const invalidLat = validateCoordinates(95.4, 12.3);
    expect(invalidLat.isValid).toBe(false);
    expect(invalidLat.error).toContain('Latitude 95.4 is out of bounds');
  });

  it('detects potential latitude/longitude swap', () => {
    // If user inputs lat: 120 (clearly outside 90) but lon: 30 (valid as lat)
    const swapped = validateCoordinates(120.5, 31.2);
    expect(swapped.isValid).toBe(false);
    expect(swapped.isPotentialSwap).toBe(true);
    expect(swapped.error).toContain('appear to be swapped');
  });

  it('rejects non-numeric and NaN coordinates', () => {
    expect(validateCoordinates('invalid', 10).isValid).toBe(false);
    expect(validateCoordinates(NaN, 10).isValid).toBe(false);
    expect(validateCoordinates(10, Infinity).isValid).toBe(false);
    expect(validateCoordinates(null, undefined).isValid).toBe(false);
  });
});
