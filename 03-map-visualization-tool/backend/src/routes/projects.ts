import { Router, Request, Response } from 'express';

export const projectsRouter = Router();

export interface MapProjectRecord {
  id: string;
  title: string;
  description?: string;
  centerLat: number;
  centerLon: number;
  zoom: number;
  pitch: number;
  bearing: number;
  basemapStyle: string;
  layers: any[];
  filters: any[];
  updatedAt: string;
}

const mapProjects = new Map<string, MapProjectRecord>();

// Seed default project
mapProjects.set('proj-london-air-quality', {
  id: 'proj-london-air-quality',
  title: 'London Environmental Particulate Analysis',
  description: 'Spatial density and particulate exposure analysis across South Bank',
  centerLat: 51.5045,
  centerLon: -0.1145,
  zoom: 13.0,
  pitch: 30.0,
  bearing: 15.0,
  basemapStyle: 'dark',
  layers: [
    {
      id: 'layer-1',
      datasetId: 'ds-air-quality',
      name: 'Air Quality Sensors (Points)',
      type: 'POINT',
      isVisible: true,
      config: { colorScale: 'viridis', colorField: 'pm25', radiusScale: 2.0, opacity: 0.85 },
    },
    {
      id: 'layer-2',
      datasetId: 'ds-air-quality',
      name: 'NO2 Concentration Density (Heatmap)',
      type: 'HEATMAP',
      isVisible: true,
      config: { weightField: 'no2', opacity: 0.65 },
    },
  ],
  filters: [],
  updatedAt: new Date().toISOString(),
});

// GET /api/v1/projects
projectsRouter.get('/', (req: Request, res: Response) => {
  return res.json(Array.from(mapProjects.values()));
});

// GET /api/v1/projects/:id
projectsRouter.get('/:id', (req: Request, res: Response) => {
  const proj = mapProjects.get(req.params.id);
  if (!proj) {
    return res.status(404).json({ error: 'Project not found' });
  }
  return res.json(proj);
});

// POST /api/v1/projects
projectsRouter.post('/', (req: Request, res: Response) => {
  const { title, description, centerLat, centerLon, zoom, pitch, bearing, basemapStyle, layers, filters } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Project title is required' });
  }

  const id = `proj-${Date.now()}`;
  const record: MapProjectRecord = {
    id,
    title,
    description,
    centerLat: Number(centerLat) || 51.5074,
    centerLon: Number(centerLon) || -0.1278,
    zoom: Number(zoom) || 11.0,
    pitch: Number(pitch) || 0.0,
    bearing: Number(bearing) || 0.0,
    basemapStyle: basemapStyle || 'dark',
    layers: layers || [],
    filters: filters || [],
    updatedAt: new Date().toISOString(),
  };

  mapProjects.set(id, record);
  return res.status(201).json(record);
});

// PUT /api/v1/projects/:id
projectsRouter.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = mapProjects.get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const updated: MapProjectRecord = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  mapProjects.set(id, updated);
  return res.json(updated);
});

// POST /api/v1/projects/:id/duplicate
projectsRouter.post('/:id/duplicate', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = mapProjects.get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const newId = `proj-${Date.now()}`;
  const duplicated: MapProjectRecord = {
    ...existing,
    id: newId,
    title: `${existing.title} (Branch)`,
    updatedAt: new Date().toISOString(),
  };

  mapProjects.set(newId, duplicated);
  return res.status(201).json(duplicated);
});
