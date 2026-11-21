import { Router, Request, Response } from 'express';
import { parseCSV } from '../../../data-processing/csv-parser';
import { parseGeoJSON } from '../../../data-processing/geojson-parser';

export const datasetsRouter = Router();

export interface MemoryDataset {
  id: string;
  name: string;
  description?: string;
  sourceFormat: string;
  rowCount: number;
  bounds: [number, number, number, number];
  columns: any[];
  features: any[];
  createdAt: string;
}

// In-memory dataset storage for standalone execution
export const globalDatasets = new Map<string, MemoryDataset>();

// Seed initial dataset
const initialFeatures = [
  { id: 'f-1', latitude: 51.5002, longitude: -0.1194, geometryType: 'Point', properties: { station: 'Westminster', pm25: 14.2, no2: 32.1, aqi: 'Moderate' } },
  { id: 'f-2', latitude: 51.5055, longitude: -0.0910, geometryType: 'Point', properties: { station: 'Borough High St', pm25: 28.5, no2: 45.0, aqi: 'Unhealthy' } },
  { id: 'f-3', latitude: 51.5032, longitude: -0.1123, geometryType: 'Point', properties: { station: 'Waterloo Hub', pm25: 19.8, no2: 38.4, aqi: 'Moderate' } },
  { id: 'f-4', latitude: 51.5048, longitude: -0.1035, geometryType: 'Point', properties: { station: 'Southwark Bridge', pm25: 22.1, no2: 41.2, aqi: 'Unhealthy' } },
  { id: 'f-5', latitude: 51.5036, longitude: -0.1189, geometryType: 'Point', properties: { station: 'Jubilee Riverfront', pm25: 9.4, no2: 18.6, aqi: 'Good' } },
];

globalDatasets.set('ds-air-quality', {
  id: 'ds-air-quality',
  name: 'London Air Quality Sensor Network',
  description: 'Atmospheric particulate and NO2 observations',
  sourceFormat: 'CSV',
  rowCount: 5,
  bounds: [-0.15, 51.48, -0.08, 51.52],
  columns: [
    { name: 'station', type: 'STRING', isLatitude: false, isLongitude: false },
    { name: 'latitude', type: 'FLOAT', isLatitude: true, isLongitude: false },
    { name: 'longitude', type: 'FLOAT', isLatitude: false, isLongitude: true },
    { name: 'pm25', type: 'FLOAT', isLatitude: false, isLongitude: false },
    { name: 'no2', type: 'FLOAT', isLatitude: false, isLongitude: false },
    { name: 'aqi', type: 'STRING', isLatitude: false, isLongitude: false },
  ],
  features: initialFeatures,
  createdAt: new Date().toISOString(),
});

// GET /api/v1/datasets
datasetsRouter.get('/', (req: Request, res: Response) => {
  const list = Array.from(globalDatasets.values()).map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    sourceFormat: d.sourceFormat,
    rowCount: d.rowCount,
    bounds: d.bounds,
    createdAt: d.createdAt,
  }));
  return res.json(list);
});

// POST /api/v1/datasets/parse-preview
datasetsRouter.post('/parse-preview', (req: Request, res: Response) => {
  const { content, format } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Raw text content is required for preview.' });
  }

  try {
    if (format === 'GEOJSON') {
      const parsed = parseGeoJSON(content);
      return res.json({
        format: 'GEOJSON',
        featuresCount: parsed.featuresCount,
        bounds: parsed.bounds,
        previewFeatures: parsed.features.slice(0, 10),
      });
    } else {
      // Default CSV
      const parsed = parseCSV(content);
      return res.json({
        format: 'CSV',
        delimiter: parsed.delimiter,
        hasBOM: parsed.hasBOM,
        columns: parsed.columns,
        validRowsCount: parsed.validRowsCount,
        invalidRowsCount: parsed.invalidRowsCount,
        issues: parsed.issues.slice(0, 5),
        previewRows: parsed.rows.slice(0, 10),
      });
    }
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'File parsing failed.' });
  }
});

// POST /api/v1/datasets/ingest
datasetsRouter.post('/ingest', (req: Request, res: Response) => {
  const { name, description, content, format } = req.body;
  if (!name || !content) {
    return res.status(400).json({ error: 'name and content required.' });
  }

  const id = `ds-${Date.now()}`;
  if (format === 'GEOJSON') {
    const parsed = parseGeoJSON(content);
    const dataset: MemoryDataset = {
      id,
      name,
      description,
      sourceFormat: 'GEOJSON',
      rowCount: parsed.featuresCount,
      bounds: parsed.bounds,
      columns: [],
      features: parsed.features,
      createdAt: new Date().toISOString(),
    };
    globalDatasets.set(id, dataset);
    return res.status(201).json(dataset);
  } else {
    const parsed = parseCSV(content);
    const features = parsed.rows.map((r: any, idx: number) => ({
      id: `f-${idx}`,
      latitude: r._lat,
      longitude: r._lon,
      geometryType: 'Point',
      properties: r,
    }));
    const dataset: MemoryDataset = {
      id,
      name,
      description,
      sourceFormat: 'CSV',
      rowCount: parsed.validRowsCount,
      bounds: [-180, -90, 180, 90],
      columns: parsed.columns,
      features,
      createdAt: new Date().toISOString(),
    };
    globalDatasets.set(id, dataset);
    return res.status(201).json(dataset);
  }
});

// GET /api/v1/datasets/:id/features?bbox=minLon,minLat,maxLon,maxLat
datasetsRouter.get('/:id/features', (req: Request, res: Response) => {
  const { id } = req.params;
  const dataset = globalDatasets.get(id);
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found.' });
  }

  const bbox = req.query.bbox as string | undefined;
  let features = dataset.features;

  if (bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number);
    if (![minLon, minLat, maxLon, maxLat].some(Number.isNaN)) {
      features = features.filter((f) => {
        const lon = f.longitude || f.coordinates?.[0];
        const lat = f.latitude || f.coordinates?.[1];
        if (lon == null || lat == null) return false;
        return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
      });
    }
  }

  return res.json({
    datasetId: id,
    totalCount: features.length,
    features: features.slice(0, 500),
  });
});

// GET /api/v1/datasets/:id/summary
datasetsRouter.get('/:id/summary', (req: Request, res: Response) => {
  const { id } = req.params;
  const dataset = globalDatasets.get(id);
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found.' });
  }

  return res.json({
    id: dataset.id,
    name: dataset.name,
    rowCount: dataset.rowCount,
    bounds: dataset.bounds,
    columns: dataset.columns,
  });
});
