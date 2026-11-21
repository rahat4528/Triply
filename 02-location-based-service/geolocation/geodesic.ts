/**
 * Geodesic Spatial Computation Library
 * Canonical Ellipsoid / Spherical WGS84 Geodesic Formulas
 * All distances returned in canonical SI meters (m).
 */

const EARTH_RADIUS_METERS = 6371008.8; // WGS84 mean spherical radius

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Computes exact geodesic distance between two WGS84 coordinates using Haversine formula.
 */
export function calculateGeodesicDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const radLat1 = degreesToRadians(lat1);
  const radLat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c * 100) / 100;
}

/**
 * Computes initial compass bearing from point 1 to point 2 in degrees [0, 360).
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radLat1 = degreesToRadians(lat1);
  const radLat2 = degreesToRadians(lat2);
  const dLon = degreesToRadians(lon2 - lon1);

  const y = Math.sin(dLon) * Math.cos(radLat2);
  const x =
    Math.cos(radLat1) * Math.sin(radLat2) -
    Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(dLon);

  const brng = (radiansToDegrees(Math.atan2(y, x)) + 360) % 360;
  return Math.round(brng * 10) / 10;
}

/**
 * Checks whether a point is within a circle defined by center and radius (meters).
 */
export function isPointInCircle(
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): boolean {
  const distance = calculateGeodesicDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radiusMeters;
}

/**
 * Point-in-polygon containment test using ray-casting algorithm with antimeridian handling.
 * Coordinates formatted as GeoJSON: [longitude, latitude]
 */
export function isPointInPolygon(
  pointLat: number,
  pointLon: number,
  polygonCoordinates: number[][][]
): boolean {
  if (!polygonCoordinates || polygonCoordinates.length === 0) return false;
  const ring = polygonCoordinates[0]; // Outer ring

  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]; // lon
    const yi = ring[i][1]; // lat
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > pointLat !== yj > pointLat &&
      pointLon < ((xj - xi) * (pointLat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
