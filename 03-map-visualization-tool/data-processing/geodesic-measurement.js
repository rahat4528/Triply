"use strict";
/**
 * Geodesic Distance and Area Measurement Tools
 * Accurate spherical calculations in canonical SI units (meters and square meters).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLineDistance = calculateLineDistance;
exports.calculatePolygonArea = calculatePolygonArea;
const EARTH_RADIUS_METERS = 6371008.8;
function toRad(deg) {
    return (deg * Math.PI) / 180;
}
/**
 * Calculates geodesic length along a sequence of coordinates [lon, lat]
 */
function calculateLineDistance(coordinates) {
    if (coordinates.length < 2)
        return 0;
    let totalMeters = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        const [lon1, lat1] = coordinates[i];
        const [lon2, lat2] = coordinates[i + 1];
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(toRad(lat1)) * Math.cos(toRad(lat2));
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        totalMeters += EARTH_RADIUS_METERS * c;
    }
    return Math.round(totalMeters * 100) / 100;
}
/**
 * Calculates geodesic polygon area using spherical excess
 */
function calculatePolygonArea(ring) {
    if (ring.length < 3)
        return 0;
    let totalExcess = 0;
    for (let i = 0; i < ring.length; i++) {
        const [lon1, lat1] = ring[i];
        const [lon2, lat2] = ring[(i + 1) % ring.length];
        totalExcess += toRad(lon2 - lon1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
    }
    const area = Math.abs((totalExcess * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 2.0);
    return Math.round(area * 100) / 100;
}
