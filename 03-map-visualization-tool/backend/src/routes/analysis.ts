import { Router, Request, Response } from 'express';
import { aggregateToGrid } from '../../../visualization/spatial-aggregator';
import { calculateLineDistance, calculatePolygonArea } from '../../../data-processing/geodesic-measurement';
import { globalDatasets } from './datasets';

export const analysisRouter = Router();

// POST /api/v1/analysis/aggregate
analysisRouter.post('/aggregate', (req: Request, res: Response) => {
  const { datasetId, gridSizeDegrees, metricField } = req.body;
  const dataset = globalDatasets.get(datasetId);

  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }

  const points = dataset.features
    .filter((f) => f.latitude != null && f.longitude != null)
    .map((f) => ({
      latitude: f.latitude,
      longitude: f.longitude,
      value: metricField && f.properties?.[metricField] != null ? Number(f.properties[metricField]) : 1,
    }));

  const bins = aggregateToGrid(points, Number(gridSizeDegrees) || 0.02);

  return res.json({
    datasetId,
    gridSizeDegrees: Number(gridSizeDegrees) || 0.02,
    binsCount: bins.length,
    bins,
  });
});

// POST /api/v1/analysis/measure/distance
analysisRouter.post('/measure/distance', (req: Request, res: Response) => {
  const { coordinates } = req.body; // Array of [lon, lat]
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return res.status(400).json({ error: 'At least two coordinate pairs [lon, lat] required.' });
  }

  const lengthMeters = calculateLineDistance(coordinates);
  return res.json({
    meters: lengthMeters,
    kilometers: Math.round((lengthMeters / 1000) * 100) / 100,
    miles: Math.round((lengthMeters / 1609.344) * 100) / 100,
  });
});

// POST /api/v1/analysis/measure/area
analysisRouter.post('/measure/area', (req: Request, res: Response) => {
  const { ring } = req.body; // Array of [lon, lat]
  if (!Array.isArray(ring) || ring.length < 3) {
    return res.status(400).json({ error: 'At least three coordinate pairs [lon, lat] required for polygon.' });
  }

  const areaSqMeters = calculatePolygonArea(ring);
  return res.json({
    squareMeters: areaSqMeters,
    squareKilometers: Math.round((areaSqMeters / 1e6) * 1000) / 1000,
    hectares: Math.round((areaSqMeters / 1e4) * 100) / 100,
    acres: Math.round((areaSqMeters / 4046.86) * 100) / 100,
  });
});
