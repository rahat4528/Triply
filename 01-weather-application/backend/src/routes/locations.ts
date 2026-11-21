import { Router, Request, Response } from 'express';
import { globalWeatherService } from '../services/weather.service';
import { validateCoordinates } from '../../../integrations/coordinate-validator';

export const locationsRouter = Router();

// In-memory store for favorites and recent searches for standalone running
interface SavedLocationItem {
  id: string;
  name: string;
  administrative?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
}

let favoriteLocations: SavedLocationItem[] = [
  {
    id: 'fav-london',
    name: 'London',
    administrative: 'Greater London, England',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    elevation: 25.0,
  },
  {
    id: 'fav-tokyo',
    name: 'Tokyo',
    administrative: 'Tokyo Prefecture',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
    elevation: 40.0,
  },
  {
    id: 'fav-ny',
    name: 'New York',
    administrative: 'New York, NY',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    elevation: 10.0,
  },
];

let recentSearches: Array<{
  id: string;
  query: string;
  resolvedName: string;
  latitude: number;
  longitude: number;
  country?: string;
  timestamp: string;
}> = [];

// GET /api/v1/locations/search?q=
locationsRouter.get('/search', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query || query.trim().length === 0) {
    return res.json([]);
  }

  try {
    const results = await globalWeatherService.searchLocations(query);
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Geocoding search failed' });
  }
});

// GET /api/v1/locations/reverse?lat=&lon=
locationsRouter.get('/reverse', async (req: Request, res: Response) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const val = validateCoordinates(lat, lon);

  if (!val.isValid) {
    return res.status(400).json({ error: val.error, isPotentialSwap: val.isPotentialSwap });
  }

  return res.json({
    latitude: val.latitude,
    longitude: val.longitude,
    name: `Observed Location (${val.latitude.toFixed(2)}, ${val.longitude.toFixed(2)})`,
    timezone: 'auto',
  });
});

// GET /api/v1/locations/favorites
locationsRouter.get('/favorites', (req: Request, res: Response) => {
  return res.json(favoriteLocations);
});

// POST /api/v1/locations/favorites
locationsRouter.post('/favorites', (req: Request, res: Response) => {
  const { name, administrative, country, latitude, longitude, timezone, elevation } = req.body;
  const val = validateCoordinates(latitude, longitude);

  if (!val.isValid) {
    return res.status(400).json({ error: val.error });
  }

  const existing = favoriteLocations.find(
    (f) => Math.abs(f.latitude - val.latitude) < 0.01 && Math.abs(f.longitude - val.longitude) < 0.01
  );

  if (existing) {
    return res.json(existing);
  }

  const newFav: SavedLocationItem = {
    id: `fav-${Date.now()}`,
    name: name || `Location (${val.latitude.toFixed(2)}, ${val.longitude.toFixed(2)})`,
    administrative,
    country,
    latitude: val.latitude,
    longitude: val.longitude,
    timezone: timezone || 'UTC',
    elevation,
  };

  favoriteLocations.push(newFav);
  return res.status(201).json(newFav);
});

// DELETE /api/v1/locations/favorites/:id
locationsRouter.delete('/favorites/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = favoriteLocations.length;
  favoriteLocations = favoriteLocations.filter((f) => f.id !== id);

  if (favoriteLocations.length === initialLength) {
    return res.status(404).json({ error: 'Favorite location not found' });
  }

  return res.json({ success: true, message: 'Favorite removed' });
});

// GET /api/v1/locations/recent
locationsRouter.get('/recent', (req: Request, res: Response) => {
  return res.json(recentSearches);
});

// POST /api/v1/locations/recent
locationsRouter.post('/recent', (req: Request, res: Response) => {
  const { query, resolvedName, latitude, longitude, country } = req.body;
  if (!query || !resolvedName) {
    return res.status(400).json({ error: 'query and resolvedName required' });
  }

  const item = {
    id: `rec-${Date.now()}`,
    query,
    resolvedName,
    latitude: Number(latitude) || 0,
    longitude: Number(longitude) || 0,
    country,
    timestamp: new Date().toISOString(),
  };

  recentSearches = [item, ...recentSearches.slice(0, 9)];
  return res.status(201).json(item);
});

// DELETE /api/v1/locations/recent
locationsRouter.delete('/recent', (req: Request, res: Response) => {
  recentSearches = [];
  return res.json({ success: true, message: 'Recent search history cleared' });
});
