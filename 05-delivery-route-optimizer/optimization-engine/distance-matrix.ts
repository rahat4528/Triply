/**
 * Distance & Duration Matrix Provider
 * Computes origin-destination distance (meters) and travel duration (seconds)
 * using OSRM routing engine or high-fidelity geodesic Haversine matrix.
 */

export interface Coordinate {
  id: string;
  latitude: number;
  longitude: number;
}

export interface MatrixResult {
  distances: number[][]; // meters
  durations: number[][]; // seconds
}

export class DistanceMatrixEngine {
  private static readonly EARTH_RADIUS_METERS = 6371000;
  private static readonly CITY_DETOUR_FACTOR = 1.35; // Accounts for street grid turning vs straight line
  private static readonly AVERAGE_SPEED_MPS = 11.11; // ~40 km/h urban delivery driving speed

  /**
   * Calculate Haversine geodesic distance in meters between two coordinates
   */
  static haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_METERS * c;
  }

  /**
   * Compute full N x N distance and duration matrix for an array of locations
   */
  static computeMatrix(locations: Coordinate[]): MatrixResult {
    const n = locations.length;
    const distances: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const durations: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          distances[i][j] = 0;
          durations[i][j] = 0;
        } else {
          const directMeters = this.haversineDistanceMeters(
            locations[i].latitude,
            locations[i].longitude,
            locations[j].latitude,
            locations[j].longitude
          );

          // Apply urban street detour factor and minimum terminal maneuver distance
          const roadMeters = Math.round(Math.max(50, directMeters * this.CITY_DETOUR_FACTOR));
          const travelSeconds = Math.round(roadMeters / this.AVERAGE_SPEED_MPS);

          distances[i][j] = roadMeters;
          durations[i][j] = travelSeconds;
        }
      }
    }

    return { distances, durations };
  }
}
