import express from 'express';
import cors from 'cors';
import { tripsRouter } from './routes/trips';
import { itineraryRouter } from './routes/itinerary';
import { expensesRouter } from './routes/expenses';
import { collaboratorsRouter } from './routes/collaborators';
import { checklistRouter } from './routes/checklist';
import { calendarRouter } from './routes/calendar';

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Healthcheck
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'triply-travel-planner-backend',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API endpoints
  app.use('/api/v1/trips', tripsRouter);
  app.use('/api/v1/trips/:tripId/itinerary', itineraryRouter);
  app.use('/api/v1/trips/:tripId/expenses', expensesRouter);
  app.use('/api/v1/trips/:tripId/collaborators', collaboratorsRouter);
  app.use('/api/v1/trips/:tripId/checklist', checklistRouter);
  app.use('/api/v1/trips/:tripId', calendarRouter);

  // Global invitation accept route alias
  app.post('/api/v1/invitations/accept', (req, res, next) => {
    req.url = '/invitations/accept';
    collaboratorsRouter(req, res, next);
  });

  return app;
}
