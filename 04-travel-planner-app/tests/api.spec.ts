// @ts-ignore
import request from 'supertest';
import { createServer } from '../backend/src/server';
import { resetTripsStore } from '../backend/src/routes/trips';

describe('Travel Planner API Endpoints', () => {
  const app = createServer();

  beforeEach(() => {
    resetTripsStore();
  });

  it('GET /health returns healthy service status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('triply-travel-planner-backend');
  });

  it('GET /api/v1/trips returns list of trips', async () => {
    const res = await request(app).get('/api/v1/trips');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('POST /api/v1/trips creates a new trip', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        title: 'Swiss Alps Trail',
        description: 'Hiking through Lauterbrunnen and Zermatt',
        startDate: '2026-08-01',
        endDate: '2026-08-07',
        baseCurrency: 'CHF',
        budgetLimitMinor: 300000
      }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Swiss Alps Trail');
    expect(res.body.data.baseCurrency).toBe('CHF');
  });

  it('GET /api/v1/trips/:id returns detailed trip info', async () => {
    const res = await request(app).get('/api/v1/trips/trip-japan-alpine-2026');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('Alpine Japan');
    expect(res.body.data.destinations).toHaveLength(3);
  });

  it('GET /api/v1/trips/:tripId/itinerary returns days and activities', async () => {
    const res = await request(app).get('/api/v1/trips/trip-japan-alpine-2026/itinerary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.days).toHaveLength(3);
    expect(res.body.days[0].items.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/trips/:tripId/itinerary/items adds a new activity', async () => {
    const res = await request(app)
      .post('/api/v1/trips/trip-japan-alpine-2026/itinerary/items')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        dayId: 'day-01',
        title: 'Late Night Ramen in Shinjuku',
        itemType: 'DINING',
        startTime: '2026-10-10T22:30:00.000Z',
        endTime: '2026-10-10T23:30:00.000Z',
        locationName: 'Ichiran Shinjuku',
        costMinor: 1200,
        currency: 'JPY'
      }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Late Night Ramen in Shinjuku');
  });

  it('GET /api/v1/trips/:tripId/expenses returns budget calculation', async () => {
    const res = await request(app).get('/api/v1/trips/trip-japan-alpine-2026/expenses');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSpentBaseMinor).toBeGreaterThan(0);
    expect(res.body.data.baseCurrency).toBe('USD');
    expect(res.body.data.categoryBreakdown).toBeDefined();
  });

  it('POST /api/v1/trips/:tripId/expenses logs an expense and converts currency', async () => {
    const res = await request(app)
      .post('/api/v1/trips/trip-japan-alpine-2026/expenses')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        description: 'Museum admission tickets',
        amountMinor: 3000,
        currency: 'JPY',
        category: 'ACTIVITIES',
        exchangeRateToBase: 0.0067
      }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amountInBaseCurrencyMinor).toBe(2010); // 3000 JPY * 0.0067 = $20.10 USD -> 2010 cents
  });

  it('POST /api/v1/trips/:tripId/collaborators/invitations creates collaboration token', async () => {
    const res = await request(app)
      .post('/api/v1/trips/trip-japan-alpine-2026/collaborators/invitations')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        email: 'collaborator@example.com',
        role: 'EDITOR',
        expiresInHours: 72
      }));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.role).toBe('EDITOR');
  });

  it('GET /api/v1/trips/:tripId/checklist returns checklist status', async () => {
    const res = await request(app).get('/api/v1/trips/trip-japan-alpine-2026/checklist');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(6);
    expect(res.body.completed).toBe(3);
    expect(res.body.completionPercentage).toBe(50);
  });

  it('GET /api/v1/trips/:tripId/calendar.ics returns RFC 5545 iCalendar stream', async () => {
    const res = await request(app).get('/api/v1/trips/trip-japan-alpine-2026/calendar.ics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/calendar');
    expect(res.text).toContain('BEGIN:VCALENDAR');
    expect(res.text).toContain('BEGIN:VEVENT');
    expect(res.text).toContain('END:VCALENDAR');
  });
});
