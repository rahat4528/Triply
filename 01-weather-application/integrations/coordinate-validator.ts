/**
 * Geographic Coordinate Validation and Swap Detection
 * Canonical CRS: WGS84 (EPSG:4326)
 */

export interface CoordinateValidationResult {
  isValid: boolean;
  latitude: number;
  longitude: number;
  error?: string;
  isPotentialSwap?: boolean;
}

export function validateCoordinates(lat: unknown, lon: unknown): CoordinateValidationResult {
  const parsedLat = typeof lat === 'string' ? parseFloat(lat) : Number(lat);
  const parsedLon = typeof lon === 'string' ? parseFloat(lon) : Number(lon);

  if (Number.isNaN(parsedLat) || !Number.isFinite(parsedLat)) {
    return {
      isValid: false,
      latitude: 0,
      longitude: 0,
      error: 'Latitude must be a valid, finite number.',
    };
  }

  if (Number.isNaN(parsedLon) || !Number.isFinite(parsedLon)) {
    return {
      isValid: false,
      latitude: 0,
      longitude: 0,
      error: 'Longitude must be a valid, finite number.',
    };
  }

  // Check latitude range [-90, 90]
  if (parsedLat < -90 || parsedLat > 90) {
    // If latitude is between -180 and 180, it might be a swapped coordinate
    const isPotentialSwap = parsedLon >= -90 && parsedLon <= 90;
    return {
      isValid: false,
      latitude: parsedLat,
      longitude: parsedLon,
      isPotentialSwap,
      error: `Latitude ${parsedLat} is out of bounds [-90, 90].${isPotentialSwap ? ' Latitude and longitude appear to be swapped.' : ''}`,
    };
  }

  // Check longitude range [-180, 180]
  if (parsedLon < -180 || parsedLon > 180) {
    return {
      isValid: false,
      latitude: parsedLat,
      longitude: parsedLon,
      error: `Longitude ${parsedLon} is out of bounds [-180, 180].`,
    };
  }

  return {
    isValid: true,
    latitude: parsedLat,
    longitude: parsedLon,
    isPotentialSwap: false,
  };
}
