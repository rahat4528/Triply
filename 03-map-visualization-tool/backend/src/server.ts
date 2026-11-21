import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { datasetsRouter } from './routes/datasets';
import { analysisRouter } from './routes/analysis';
import { projectsRouter } from './routes/projects';
import { exportsRouter } from './routes/exports';
import { sharesRouter } from './routes/shares';

export function createServer(): Express {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.get('/health', (req: Request, res: Response) => {
    return res.json({
      status: 'UP',
      service: '03-map-visualization-tool-backend',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/v1/datasets', datasetsRouter);
  app.use('/api/v1/analysis', analysisRouter);
  app.use('/api/v1/projects', projectsRouter);
  app.use('/api/v1/exports', exportsRouter);
  app.use('/api/v1/shares', sharesRouter);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Map Viz Service Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
