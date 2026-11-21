// @ts-ignore
import request from 'supertest';
import { createServer } from '../backend/src/server';
import { resetVehiclesStore } from '../backend/src/routes/vehicles';
import { resetJobsStore } from '../backend/src/routes/jobs';
import { resetRunsStore } from '../backend/src/routes/optimize';

describe('Delivery Route Optimizer API Endpoints', () => {
  const app = createServer();

  beforeEach(() => {
    resetVehiclesStore();
    resetJobsStore();
    resetRunsStore();
  });

  it('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('triply-delivery-route-optimizer-backend');
  });

  it('GET /api/v1/vehicles returns fleet list with driver info', async () => {
    const res = await request(app).get('/api/v1/vehicles');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.data[0].capacityKg).toBeDefined();
  });

  it('POST /api/v1/vehicles registers a new vehicle', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        code: 'FLEET-TEST-99',
        name: 'Ford E-Transit',
        vehicleType: 'ELECTRIC_VAN',
        capacityKg: 1100,
        capacityM3: 9.0,
        capacityPieces: 55
      }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('FLEET-TEST-99');
  });

  it('GET /api/v1/jobs returns delivery jobs', async () => {
    const res = await request(app).get('/api/v1/jobs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('POST /api/v1/jobs creates a new delivery stop', async () => {
    const res = await request(app)
      .post('/api/v1/jobs')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        customerName: 'Seattle Aquarium Cafe',
        address: '1483 Alaskan Way, Seattle, WA',
        latitude: 47.6074,
        longitude: -122.3429,
        demandKg: 65,
        demandM3: 0.6,
        demandPieces: 4,
        timeWindowStartSec: 36000,
        timeWindowEndSec: 50400,
        serviceDurationSec: 300,
        jobType: 'DELIVERY'
      }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.customerName).toBe('Seattle Aquarium Cafe');
  });

  it('POST /api/v1/optimize runs solver and returns verified routes', async () => {
    const res = await request(app)
      .post('/api/v1/optimize')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({}));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.routes.length).toBeGreaterThan(0);
    expect(res.body.data.totalDistanceMeters).toBeGreaterThan(0);
    expect(res.body.data.validationReport.isValid).toBe(true);
  });

  it('GET /api/v1/optimize/runs returns historical runs', async () => {
    // Generate one run first
    await request(app)
      .post('/api/v1/optimize')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({}));

    const res = await request(app).get('/api/v1/optimize/runs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
  });

  it('POST /api/v1/optimize/runs/:id/dispatch handles dispatch and detects optimistic concurrency conflicts', async () => {
    const runRes = await request(app)
      .post('/api/v1/optimize')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({}));
    const runId = runRes.body.data.id;

    // Successful dispatch
    const dispatchRes = await request(app)
      .post(`/api/v1/optimize/runs/${runId}/dispatch`)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ version: 1 }));

    expect(dispatchRes.status).toBe(200);
    expect(dispatchRes.body.status).toBe('DISPATCHED');
    expect(dispatchRes.body.version).toBe(2);

    // Stale version conflict
    const conflictRes = await request(app)
      .post(`/api/v1/optimize/runs/${runId}/dispatch`)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ version: 1 }));

    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.error).toContain('Conflict');
  });

  it('GET /api/v1/driver/:vehicleId/route returns driver route', async () => {
    await request(app)
      .post('/api/v1/optimize')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({}));

    const res = await request(app).get('/api/v1/driver/veh-01/route');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stops.length).toBeGreaterThan(0);
  });

  it('PATCH /api/v1/driver/stops/:stopId/status updates stop progression', async () => {
    await request(app)
      .post('/api/v1/optimize')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({}));

    const res = await request(app)
      .patch('/api/v1/driver/stops/2/status')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: 'DELIVERED',
        notes: 'Handed directly to store manager'
      }));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deliveryStatus).toBe('DELIVERED');
  });
});
