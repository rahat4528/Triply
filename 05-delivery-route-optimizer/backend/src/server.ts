import express from 'express';
import cors from 'cors';
import { vehiclesRouter } from './routes/vehicles';
import { jobsRouter } from './routes/jobs';
import { optimizeRouter } from './routes/optimize';
import { driverRouter } from './routes/driver';

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Healthcheck
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'triply-delivery-route-optimizer-backend',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API endpoints
  app.use('/api/v1/vehicles', vehiclesRouter);
  app.use('/api/v1/jobs', jobsRouter);
  app.use('/api/v1/optimize', optimizeRouter);
  app.use('/api/v1/driver', driverRouter);

  return app;
}
