import { Router, Request, Response } from 'express';
import { globalDatasets } from './datasets';

export const exportsRouter = Router();

interface ExportJobRecord {
  id: string;
  datasetId: string;
  format: 'CSV' | 'GEOJSON';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  createdAt: string;
}

const exportJobs = new Map<string, ExportJobRecord>();

// POST /api/v1/exports
exportsRouter.post('/', (req: Request, res: Response) => {
  const { datasetId, format } = req.body;
  const dataset = globalDatasets.get(datasetId);

  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }

  const jobId = `job-${Date.now()}`;
  const job: ExportJobRecord = {
    id: jobId,
    datasetId,
    format: format === 'GEOJSON' ? 'GEOJSON' : 'CSV',
    status: 'COMPLETED',
    downloadUrl: `/api/v1/exports/${jobId}/download`,
    createdAt: new Date().toISOString(),
  };

  exportJobs.set(jobId, job);
  return res.status(201).json(job);
});

// GET /api/v1/exports/:id
exportsRouter.get('/:id', (req: Request, res: Response) => {
  const job = exportJobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Export job not found' });
  }
  return res.json(job);
});

// GET /api/v1/exports/:id/download
exportsRouter.get('/:id/download', (req: Request, res: Response) => {
  const job = exportJobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Export job not found' });
  }

  const dataset = globalDatasets.get(job.datasetId);
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }

  if (job.format === 'GEOJSON') {
    const geojson = {
      type: 'FeatureCollection',
      features: dataset.features.map((f) => ({
        type: 'Feature',
        geometry: {
          type: f.geometryType,
          coordinates: [f.longitude, f.latitude],
        },
        properties: f.properties,
      })),
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${dataset.name}.geojson"`);
    return res.send(JSON.stringify(geojson, null, 2));
  } else {
    // CSV export
    const headers = dataset.columns.map((c) => c.name);
    const rows = [headers.join(',')];
    dataset.features.forEach((f) => {
      const row = headers.map((h) => f.properties?.[h] ?? '');
      rows.push(row.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${dataset.name}.csv"`);
    return res.send(rows.join('\n'));
  }
});
