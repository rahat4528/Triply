// @ts-ignore
import request from 'supertest';
import { createServer } from '../backend/src/server';

const app = createServer();

describe('Weather Application REST API Endpoints', () => {
  it('GET /health returns service status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('01-weather-application-backend');
  });

  describe('Location Services', () => {
    it('GET /api/v1/locations/search returns resolved localities', async () => {
      const res = await request(app).get('/api/v1/locations/search?q=London');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toContain('London');
    });

    it('GET /api/v1/locations/favorites retrieves pinned cities', async () => {
      const res = await request(app).get('/api/v1/locations/favorites');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((f: any) => f.name === 'London')).toBe(true);
    });

    it('POST /api/v1/locations/favorites validates coordinates before saving', async () => {
      const invalidRes = await request(app)
        .post('/api/v1/locations/favorites')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ name: 'Invalid Island', latitude: 999, longitude: 0 }));
      expect(invalidRes.status).toBe(400);

      const validRes = await request(app)
        .post('/api/v1/locations/favorites')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ name: 'Paris', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' }));
      expect([200, 201]).toContain(validRes.status);
    });
  });

  describe('Weather & Forecasting', () => {
    it('GET /api/v1/weather/current returns valid atmospheric telemetry', async () => {
      const res = await request(app)
        .get('/api/v1/weather/current?lat=51.5074&lon=-0.1278');
      expect(res.status).toBe(200);
      expect(res.body.current).toBeDefined();
      expect(res.body.current.temperature).toBeDefined();
      expect(res.body.current.observedAt).toBeDefined();
      expect(res.body.dataSource.attribution).toBeTruthy();
    });

    it('GET /api/v1/weather/historical returns reanalysis archive data', async () => {
      const res = await request(app)
        .get('/api/v1/weather/historical?lat=51.5074&lon=-0.1278&startDate=2023-01-01&endDate=2023-01-07');
      expect(res.status).toBe(200);
      expect(res.body.dataType).toBe('REANALYSIS_ARCHIVE');
      expect(Array.isArray(res.body.daily)).toBe(true);
    });

    it('POST /api/v1/weather/compare synchronizes multiple locations', async () => {
      const res = await request(app)
        .post('/api/v1/weather/compare')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          locations: [
            { name: 'London', lat: 51.5074, lon: -0.1278 },
            { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
          ],
        }));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe('Alerts & Widgets', () => {
    it('GET /api/v1/alerts/rules returns rule list', async () => {
      const res = await request(app).get('/api/v1/alerts/rules');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/v1/alerts/evaluate evaluates rules', async () => {
      const res = await request(app).post('/api/v1/alerts/evaluate');
      expect(res.status).toBe(200);
      expect(res.body.evaluatedCount).toBeGreaterThan(0);
    });

    it('GET /api/v1/widgets/:token/data returns widget payload', async () => {
      const res = await request(app).get('/api/v1/widgets/wgt_sample_london/data');
      expect(res.status).toBe(200);
      expect(res.body.locationName).toBe('London');
      expect(res.body.current).toBeDefined();
    });
  });
});
