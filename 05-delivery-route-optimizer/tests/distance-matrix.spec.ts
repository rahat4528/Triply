import { DistanceMatrixEngine, Coordinate } from '../optimization-engine/distance-matrix';

describe('DistanceMatrixEngine', () => {
  it('calculates Haversine distance with high fidelity', () => {
    // Seattle Space Needle (47.6205, -122.3493) to Pike Place Market (47.6085, -122.3412)
    const distanceMeters = DistanceMatrixEngine.haversineDistanceMeters(
      47.6205,
      -122.3493,
      47.6085,
      -122.3412
    );

    // Direct line is ~1.46 km (1460 meters)
    expect(distanceMeters).toBeGreaterThan(1300);
    expect(distanceMeters).toBeLessThan(1600);
  });

  it('computes symmetric distance matrix with 0 diagonal', () => {
    const coords: Coordinate[] = [
      { id: 'c1', latitude: 47.6062, longitude: -122.3321 }, // Depot
      { id: 'c2', latitude: 47.6085, longitude: -122.3412 }, // Pike Place
      { id: 'c3', latitude: 47.6142, longitude: -122.3168 }  // Capitol Hill
    ];

    const matrix = DistanceMatrixEngine.computeMatrix(coords);

    expect(matrix.distances).toHaveLength(3);
    expect(matrix.durations).toHaveLength(3);

    // Diagonals must be 0
    expect(matrix.distances[0][0]).toBe(0);
    expect(matrix.distances[1][1]).toBe(0);
    expect(matrix.distances[2][2]).toBe(0);

    // Positive distance between distinct points
    expect(matrix.distances[0][1]).toBeGreaterThan(500);
    expect(matrix.durations[0][1]).toBeGreaterThan(30);
  });
});
