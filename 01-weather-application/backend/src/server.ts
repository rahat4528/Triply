import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { locationsRouter } from './routes/locations';
import { weatherRouter } from './routes/weather';
import { alertsRouter } from './routes/alerts';
import { preferencesRouter } from './routes/preferences';
import { widgetsRouter } from './routes/widgets';

export function createServer(): Express {
  const app = express();

  // Security headers & CORS
  app.use(helmet({
    contentSecurityPolicy: false, // Allow iframe embedding for widgets
    frameguard: false,
  }));
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }));
  app.use(express.json());

  // Healthcheck endpoint
  app.get('/health', (req: Request, res: Response) => {
    return res.json({
      status: 'UP',
      service: '01-weather-application-backend',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routers
  app.use('/api/v1/locations', locationsRouter);
  app.use('/api/v1/weather', weatherRouter);
  app.use('/api/v1/alerts', alertsRouter);
  app.use('/api/v1/preferences', preferencesRouter);
  app.use('/api/v1/widgets', widgetsRouter);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
  });

  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
