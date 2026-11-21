/**
 * Spatial Aggregation & Grid Binning
 */

export interface SpatialBin {
  binId: string;
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  centerLon: number;
  centerLat: number;
  count: number;
  metricAverage?: number;
}

export function aggregateToGrid(
  points: { latitude: number; longitude: number; value?: number }[],
  gridSizeDegrees = 0.02
): SpatialBin[] {
  const binsMap = new Map<string, { count: number; sumVal: number; minLat: number; minLon: number }>();

  points.forEach((pt) => {
    const latBin = Math.floor(pt.latitude / gridSizeDegrees) * gridSizeDegrees;
    const lonBin = Math.floor(pt.longitude / gridSizeDegrees) * gridSizeDegrees;
    const key = `${latBin.toFixed(4)}:${lonBin.toFixed(4)}`;

    const existing = binsMap.get(key) || { count: 0, sumVal: 0, minLat: latBin, minLon: lonBin };
    existing.count++;
    existing.sumVal += pt.value || 1;
    binsMap.set(key, existing);
  });

  const bins: SpatialBin[] = [];
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
