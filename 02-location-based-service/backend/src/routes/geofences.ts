import { Router, Request, Response } from 'express';
import { globalGeofenceService } from '../services/geofence.service';

export const geofencesRouter = Router();

// GET /api/v1/geofences
geofencesRouter.get('/', (req: Request, res: Response) => {
  return res.json(globalGeofenceService.getGeofences());
});

// POST /api/v1/geofences
geofencesRouter.post('/', (req: Request, res: Response) => {
  const { name, type, latitude, longitude, radiusMeters, polygonGeoJson, dwellMinutes } = req.body;

  if (!name || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'name, latitude, and longitude are required.' });
  }

  // Validate polygon GeoJSON if polygon type
  if (type === 'POLYGON' && polygonGeoJson) {
    try {
      const parsed = JSON.parse(polygonGeoJson);
      if (!parsed.coordinates && !parsed.geometry?.coordinates) {
        return res.status(400).json({ error: 'Invalid GeoJSON polygon coordinates.' });
      }
    } catch {
      return res.status(400).json({ error: 'Malformed GeoJSON string.' });
    }
  }

  const created = globalGeofenceService.addGeofence({
    name,
    type: type === 'POLYGON' ? 'POLYGON' : 'CIRCLE',
    latitude: Number(latitude),
    longitude: Number(longitude),
    radiusMeters: Number(radiusMeters) || 500,
    polygonGeoJson,
    dwellMinutes: Number(dwellMinutes) || 1,
  });

  return res.status(201).json(created);
});

// DELETE /api/v1/geofences/:id
geofencesRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = globalGeofenceService.deleteGeofence(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Geofence not found.' });
  }
  return res.json({ success: true, message: 'Geofence deleted.' });
});

// GET /api/v1/geofences/events
geofencesRouter.get('/events', (req: Request, res: Response) => {
  return res.json(globalGeofenceService.getEventLogs());
});
