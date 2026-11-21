// @ts-ignore
import request from 'supertest';
import { createServer } from '../backend/src/server';

const app = createServer();

describe('Location-Based Service REST API Endpoints', () => {
  it('GET /health returns status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('02-location-based-service-backend');
  });

  describe('Nearby Places Discovery', () => {
    it('GET /api/v1/places/categories returns available taxonomies', async () => {
      const res = await request(app).get('/api/v1/places/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((c: any) => c.slug === 'healthcare')).toBe(true);
    });

    it('GET /api/v1/places/nearby performs radius discovery', async () => {
      const res = await request(app)
        .get('/api/v1/places/nearby?lat=51.5045&lon=-0.1145&radius=5000');
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(0);
      expect(Array.isArray(res.body.places)).toBe(true);
      // Verify distance ordering
      const places = res.body.places;
      for (let i = 1; i < places.length; i++) {
        expect(places[i].distanceMeters).toBeGreaterThanOrEqual(places[i - 1].distanceMeters);
      }
    });

    it('filters places by category', async () => {
      const res = await request(app)
        .get('/api/v1/places/nearby?lat=51.5045&lon=-0.1145&radius=5000&category=cat-health');
      expect(res.status).toBe(200);
      expect(res.body.places.every((p: any) => p.categoryId === 'cat-health')).toBe(true);
    });
  });

  describe('Geofences & Location Ping', () => {
    it('GET /api/v1/geofences returns configured geofences', async () => {
      const res = await request(app).get('/api/v1/geofences');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/v1/locations/ping processes coordinate ping and evaluates fences', async () => {
      const res = await request(app)
        .post('/api/v1/locations/ping')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          latitude: 51.5045,
          longitude: -0.1145,
          accuracy: 15,
          source: 'DEVICE',
        }));
      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
      expect(res.body.source).toBe('DEVICE');
    });
  });

  describe('Location Sharing & Privacy Center', () => {
    let shareToken = '';

    it('POST /api/v1/shares creates revocable share link', async () => {
      const res = await request(app)
        .post('/api/v1/shares')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          recipientEmail: 'trusted@triply.local',
          latitude: 51.5045,
          longitude: -0.1145,
          durationMinutes: 60,
        }));
      expect(res.status).toBe(201);
      expect(res.body.share.token).toBeDefined();
      shareToken = res.body.share.token;
    });

    it('GET /api/v1/shares/view/:token allows recipient access during active share', async () => {
      const res = await request(app).get(`/api/v1/shares/view/${shareToken}`);
      expect(res.status).toBe(200);
      expect(res.body.recipient).toBe('trusted@triply.local');
    });

    it('DELETE /api/v1/shares/:id/revoke revokes share immediately', async () => {
      const res = await request(app).delete(`/api/v1/shares/${shareToken}/revoke`);
      expect(res.status).toBe(200);

      // Verify recipient is now forbidden
      const blockedRes = await request(app).get(`/api/v1/shares/view/${shareToken}`);
      expect(blockedRes.status).toBe(403);
    });

    it('GET /api/v1/privacy/export exports user personal data', async () => {
      const res = await request(app).get('/api/v1/privacy/export');
      expect(res.status).toBe(200);
      expect(res.body.exportTimestamp).toBeDefined();
    });

    it('DELETE /api/v1/privacy/purge permanently wipes stored location data', async () => {
      const res = await request(app).delete('/api/v1/privacy/purge');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
