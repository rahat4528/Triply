import { Router, Request, Response } from 'express';
import { globalSpatialService } from '../services/spatial.service';

export const placesRouter = Router();

// GET /api/v1/places/categories
placesRouter.get('/categories', (req: Request, res: Response) => {
  return res.json(globalSpatialService.getCategories());
});

// GET /api/v1/places/nearby?lat=&lon=&radius=&category=&openNow=&search=
placesRouter.get('/nearby', (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  const radius = parseInt(req.query.radius as string, 10) || 5000;
  const categoryId = req.query.category as string | undefined;
  const openNowOnly = req.query.openNow === 'true';
  const searchTerm = req.query.search as string | undefined;

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ error: 'Valid lat and lon numeric query parameters required.' });
  }

  const results = globalSpatialService.findNearby({
    latitude: lat,
    longitude: lon,
    radiusMeters: radius,
    categoryId,
    openNowOnly,
    searchTerm,
  });

  return res.json({
    count: results.length,
    radiusMeters: radius,
    places: results,
    dataSource: {
      isSampleData: true,
      attribution: 'Sample venue datasets for local testing and development',
    },
  });
});

// POST /api/v1/places (Business creation)
placesRouter.post('/', (req: Request, res: Response) => {
  const { categoryId, name, description, address, latitude, longitude, openingHours } = req.body;
  if (!categoryId || !name || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'Missing required place fields.' });
  }

  const newPlace = globalSpatialService.addPlace({
    categoryId,
    name,
    description,
    address,
    latitude: Number(latitude),
    longitude: Number(longitude),
    isOpenNow: true,
    openingHours: openingHours || '09:00 - 18:00',
  });

  return res.status(201).json(newPlace);
});
