import { Router, Request, Response } from 'express';
import { globalGeofenceService } from '../services/geofence.service';
import { globalSharingService } from '../services/sharing.service';
import { LocationSource } from '../../../geolocation/geofence-engine';

export const locationsRouter = Router();

// In-memory active live sessions (explicitly user-started)
let activeLiveSession: {
  userId: string;
  startedAt: string;
  source: LocationSource;
  lastPing?: { latitude: number; longitude: number; accuracy: number; timestamp: string };
} | null = null;

// POST /api/v1/locations/ping
locationsRouter.post('/ping', (req: Request, res: Response) => {
  const { latitude, longitude, accuracy, source, clientUpdateId } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  const parsedLat = Number(latitude);
  const parsedLon = Number(longitude);
  const parsedAccuracy = Number(accuracy) || 20;
  const parsedSource: LocationSource = source === 'SIMULATED' ? 'SIMULATED' : source === 'MANUAL' ? 'MANUAL' : 'DEVICE';
  const now = new Date();

  // If live session is active, update lastPing
  if (activeLiveSession) {
    activeLiveSession.lastPing = {
      latitude: parsedLat,
      longitude: parsedLon,
      accuracy: parsedAccuracy,
      timestamp: now.toISOString(),
    };
  }

  // Update active shares with latest coordinates
  globalSharingService.updateLocation('usr-loc-demo-01', parsedLat, parsedLon, parsedAccuracy);

  // Evaluate active geofences
  const triggeredEvents = globalGeofenceService.evaluateLocation('usr-loc-demo-01', {
    latitude: parsedLat,
    longitude: parsedLon,
    accuracy: parsedAccuracy,
    source: parsedSource,
    timestamp: now,
    clientUpdateId,
  });

  return res.json({
    received: true,
    source: parsedSource,
    triggeredEventsCount: triggeredEvents.length,
    events: triggeredEvents,
    liveSessionActive: !!activeLiveSession,
  });
});

// POST /api/v1/locations/session/start
locationsRouter.post('/session/start', (req: Request, res: Response) => {
  const { source } = req.body;
  activeLiveSession = {
    userId: 'usr-loc-demo-01',
    startedAt: new Date().toISOString(),
    source: source === 'SIMULATED' ? 'SIMULATED' : 'DEVICE',
  };
  return res.json({ success: true, session: activeLiveSession });
});

// POST /api/v1/locations/session/stop
locationsRouter.post('/session/stop', (req: Request, res: Response) => {
  activeLiveSession = null;
  return res.json({ success: true, message: 'Live session terminated.' });
});

// GET /api/v1/locations/session/status
locationsRouter.get('/session/status', (req: Request, res: Response) => {
  return res.json({
    active: !!activeLiveSession,
    session: activeLiveSession,
  });
});
