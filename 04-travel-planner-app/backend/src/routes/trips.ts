import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { seedData } from '../../../database/seed';
import { TimezoneCalculator } from '../../../integrations/timezone-calculator';

export const tripsRouter = Router();

// In-memory operational store initialized from seed
let trips = [...seedData.trips];

export function resetTripsStore() {
  trips = JSON.parse(JSON.stringify(seedData.trips));
}

export function getTripsStore() {
  return trips;
}

// GET all trips
tripsRouter.get('/', (req: Request, res: Response) => {
  const summary = trips.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    coverImage: t.coverImage,
    startDate: t.startDate,
    endDate: t.endDate,
    baseCurrency: t.baseCurrency,
    budgetLimitMinor: t.budgetLimitMinor,
    destinationCount: t.destinations.length,
    memberCount: t.members.length,
    dayCount: TimezoneCalculator.getInclusiveDayCount(t.startDate, t.endDate)
  }));
  res.json({ success: true, count: summary.length, data: summary });
});

// GET trip by id
tripsRouter.get('/:id', (req: Request, res: Response) => {
  const trip = trips.find(t => t.id === req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const dayCount = TimezoneCalculator.getInclusiveDayCount(trip.startDate, trip.endDate);
  res.json({
    success: true,
    data: {
      ...trip,
      dayCount
    }
  });
});

// POST create trip
tripsRouter.post('/', (req: Request, res: Response) => {
  const { title, description, coverImage, startDate, endDate, baseCurrency, budgetLimitMinor, createdById } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({ success: false, error: 'Title, startDate, and endDate are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ success: false, error: 'Invalid date format' });
  }

  if (end < start) {
    return res.status(400).json({ success: false, error: 'End date cannot precede start date' });
  }

  const newTrip = {
    id: `trip-${uuidv4().substring(0, 8)}`,
    title,
    description: description || '',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200',
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    baseCurrency: baseCurrency || 'USD',
    budgetLimitMinor: Number(budgetLimitMinor) || 0,
    createdById: createdById || 'usr-travel-01',
    destinations: [],
    members: [
      { id: `mem-${uuidv4().substring(0, 8)}`, userId: createdById || 'usr-travel-01', role: 'OWNER' as const }
    ],
    days: [],
    expenses: [],
    checklist: []
  };

  trips.push(newTrip);
  res.status(201).json({ success: true, data: newTrip });
});

// PUT update trip
tripsRouter.put('/:id', (req: Request, res: Response) => {
  const trip = trips.find(t => t.id === req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const { title, description, coverImage, startDate, endDate, baseCurrency, budgetLimitMinor } = req.body;

  if (title) trip.title = title;
  if (description !== undefined) trip.description = description;
  if (coverImage) trip.coverImage = coverImage;
  if (startDate) trip.startDate = new Date(startDate).toISOString();
  if (endDate) trip.endDate = new Date(endDate).toISOString();
  if (baseCurrency) trip.baseCurrency = baseCurrency;
  if (budgetLimitMinor !== undefined) trip.budgetLimitMinor = Number(budgetLimitMinor);

  res.json({ success: true, data: trip });
});

// DELETE trip
tripsRouter.delete('/:id', (req: Request, res: Response) => {
  const index = trips.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const deleted = trips.splice(index, 1)[0];
  res.json({ success: true, message: `Trip ${deleted.title} deleted` });
});
