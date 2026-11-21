// @ts-ignore
import request from 'supertest';
import { createServer } from '../backend/src/server';

const app = createServer();

describe('Map Visualization Tool REST API Endpoints', () => {
  it('GET /health returns service status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('03-map-visualization-tool-backend');
  });

  describe('Dataset Management & Ingestion', () => {
    it('GET /api/v1/datasets returns dataset list', async () => {
      const res = await request(app).get('/api/v1/datasets');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/datasets/parse-preview parses CSV and returns column inference', async () => {
      const csv = 'station,lat,lon,pm25\nNode A,51.50,-0.12,18.5\nNode B,51.51,-0.11,22.0';
      const res = await request(app)
        .post('/api/v1/datasets/parse-preview')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ content: csv, format: 'CSV' }));

      expect(res.status).toBe(200);
      expect(res.body.validRowsCount).toBe(2);
      expect(res.body.columns.length).toBe(4);
    });

    it('GET /api/v1/datasets/:id/features supports bounding box query', async () => {
      const res = await request(app).get('/api/v1/datasets/ds-air-quality/features?bbox=-0.15,51.48,-0.08,51.52');
      expect(res.status).toBe(200);
      expect(res.body.features.length).toBeGreaterThan(0);
    });
  });

  describe('Spatial Analysis & Measurement', () => {
    it('POST /api/v1/analysis/aggregate computes spatial bins', async () => {
      const res = await request(app)
        .post('/api/v1/analysis/aggregate')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          datasetId: 'ds-air-quality',
          gridSizeDegrees: 0.05,
          metricField: 'pm25',
        }));

      expect(res.status).toBe(200);
      expect(res.body.binsCount).toBeGreaterThan(0);
    });

    it('POST /api/v1/analysis/measure/distance calculates path length', async () => {
      const res = await request(app)
        .post('/api/v1/analysis/measure/distance')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          coordinates: [
            [-0.1278, 51.5074],
            [-0.1194, 51.5002],
          ],
        }));

      expect(res.status).toBe(200);
      expect(res.body.meters).toBeGreaterThan(500);
    });
  });

  describe('Projects, Exports & Sharing', () => {
    let projectId = '';

    it('POST /api/v1/projects creates map visualization project', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          title: 'Urban Heat Island Analysis',
          centerLat: 51.5074,
          centerLon: -0.1278,
          zoom: 12,
        }));

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      projectId = res.body.id;
    });

    it('POST /api/v1/projects/:id/duplicate creates project branch', async () => {
      const res = await request(app).post(`/api/v1/projects/${projectId}/duplicate`);
      expect(res.status).toBe(201);
      expect(res.body.title).toContain('(Branch)');
    });

    it('POST /api/v1/exports creates downloadable CSV export job', async () => {
      const res = await request(app)
        .post('/api/v1/exports')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          datasetId: 'ds-air-quality',
          format: 'CSV',
        }));

      expect(res.status).toBe(201);
      expect(res.body.downloadUrl).toBeDefined();

      // Download content
      const downloadRes = await request(app).get(res.body.downloadUrl);
      expect(downloadRes.status).toBe(200);
      expect(downloadRes.headers['content-type']).toContain('text/csv');
    });

    it('POST /api/v1/shares creates public view token', async () => {
      const res = await request(app)
        .post('/api/v1/shares')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          projectId: 'proj-london-air-quality',
          role: 'VIEWER',
          durationDays: 7,
        }));

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
    });
  });
});
