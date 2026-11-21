"use strict";
/**
 * GeoJSON FeatureCollection Parser and Normalizer
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGeoJSON = parseGeoJSON;
function parseGeoJSON(content) {
    const json = JSON.parse(content);
    const rawFeatures = json.type === 'FeatureCollection' ? json.features : json.type === 'Feature' ? [json] : [];
    let minLon = 180;
    let minLat = 90;
    let maxLon = -180;
    let maxLat = -90;
    const normalized = [];
    rawFeatures.forEach((feat, idx) => {
        if (!feat.geometry || !feat.geometry.type || !feat.geometry.coordinates)
            return;
        let lat;
        let lon;
        if (feat.geometry.type === 'Point') {
            lon = feat.geometry.coordinates[0];
            lat = feat.geometry.coordinates[1];
            if (typeof lon === 'number' && typeof lat === 'number') {
                minLon = Math.min(minLon, lon);
                maxLon = Math.max(maxLon, lon);
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
            }
        }
        normalized.push({
            id: feat.id || `feat-${idx}`,
            geometryType: feat.geometry.type,
            coordinates: feat.geometry.coordinates,
            latitude: lat,
            longitude: lon,
            properties: feat.properties || {},
        });
    });
    return {
        type: json.type,
        featuresCount: normalized.length,
        features: normalized,
        bounds: [minLon, minLat, maxLon, maxLat],
    };
}
