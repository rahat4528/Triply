import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { locationsRouter } from './routes/locations';
import { placesRouter } from './routes/places';
import { geofencesRouter } from './routes/geofences';
import { sharesRouter } from './routes/shares';
import { privacyRouter } from './routes/privacy';

export function createServer(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: '*' }));
  app.use(express.json());

  app.get('/health', (req: Request, res: Response) => {
    return res.json({
      status: 'UP',
      service: '02-location-based-service-backend',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/v1/locations', locationsRouter);
  app.use('/api/v1/places', placesRouter);
  app.use('/api/v1/geofences', geofencesRouter);
  app.use('/api/v1/shares', sharesRouter);
  app.use('/api/v1/privacy', privacyRouter);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Location Service Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
