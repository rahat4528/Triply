import { isPointInPolygon } from '../geolocation/geodesic';

describe('Polygon Boundary Containment (Ray Casting)', () => {
  const squarePolygon = [
    [
      [-0.15, 51.50],
      [-0.10, 51.50],
      [-0.10, 51.45],
      [-0.15, 51.45],
      [-0.15, 51.50],
    ],
  ];

  it('identifies interior points correctly', () => {
    expect(isPointInPolygon(51.48, -0.12, squarePolygon)).toBe(true);
  });

  it('identifies exterior points correctly', () => {
    expect(isPointInPolygon(51.52, -0.12, squarePolygon)).toBe(false);
    expect(isPointInPolygon(51.48, -0.18, squarePolygon)).toBe(false);
  });

  it('handles empty or malformed coordinates safely', () => {
    expect(isPointInPolygon(51.48, -0.12, [])).toBe(false);
  });
});
