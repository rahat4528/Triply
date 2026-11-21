"use strict";
/**
 * Spatial Aggregation & Grid Binning
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateToGrid = aggregateToGrid;
function aggregateToGrid(points, gridSizeDegrees = 0.02) {
    const binsMap = new Map();
    points.forEach((pt) => {
        const latBin = Math.floor(pt.latitude / gridSizeDegrees) * gridSizeDegrees;
        const lonBin = Math.floor(pt.longitude / gridSizeDegrees) * gridSizeDegrees;
        const key = `${latBin.toFixed(4)}:${lonBin.toFixed(4)}`;
        const existing = binsMap.get(key) || { count: 0, sumVal: 0, minLat: latBin, minLon: lonBin };
        existing.count++;
        existing.sumVal += pt.value || 1;
        binsMap.set(key, existing);
    });
    const bins = [];
    binsMap.forEach((val, key) => {
        bins.push({
            binId: `bin-${key}`,
            minLon: val.minLon,
            minLat: val.minLat,
            maxLon: val.minLon + gridSizeDegrees,
            maxLat: val.minLat + gridSizeDegrees,
            centerLon: val.minLon + gridSizeDegrees / 2,
            centerLat: val.minLat + gridSizeDegrees / 2,
            count: val.count,
            metricAverage: Math.round((val.sumVal / val.count) * 100) / 100,
        });
    });
    return bins;
}
