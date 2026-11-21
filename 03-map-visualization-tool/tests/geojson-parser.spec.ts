import { parseGeoJSON } from '../data-processing/geojson-parser';

describe('GeoJSON Parser & Normalizer', () => {
  it('parses valid GeoJSON FeatureCollection and computes bounding box', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-0.1278, 51.5074] },
          properties: { name: 'London' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [139.6503, 35.6762] },
          properties: { name: 'Tokyo' },
        },
      ],
    };

    const res = parseGeoJSON(JSON.stringify(geojson));
    expect(res.featuresCount).toBe(2);
    expect(res.features[0].geometryType).toBe('Point');
    expect(res.bounds[0]).toBeCloseTo(-0.1278); // minLon
    expect(res.bounds[2]).toBeCloseTo(139.6503); // maxLon
  });
});
