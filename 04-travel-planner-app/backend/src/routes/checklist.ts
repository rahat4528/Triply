import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getTripsStore } from './trips';

export const checklistRouter = Router({ mergeParams: true });

// GET checklist items
checklistRouter.get('/', (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const total = trip.checklist.length;
  const completed = trip.checklist.filter(c => c.isCompleted).length;

  res.json({
    success: true,
    total,
    completed,
    completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    items: trip.checklist
  });
});

// POST add checklist item
checklistRouter.post('/', (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const { title, category, assignedToUserId } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  const newItem = {
    id: `chk-${uuidv4().substring(0, 8)}`,
    title,
    category: category || 'General',
    isCompleted: false,
    assignedToUserId: assignedToUserId || undefined
  };

  trip.checklist.push(newItem);
  res.status(201).json({ success: true, data: newItem });
});

// PATCH toggle checklist completion
checklistRouter.patch('/:itemId', (req: Request, res: Response) => {
  const { tripId, itemId } = req.params;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const item = trip.checklist.find(c => c.id === itemId);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Checklist item not found' });
  }

  item.isCompleted = req.body.isCompleted !== undefined ? Boolean(req.body.isCompleted) : !item.isCompleted;

  res.json({ success: true, data: item });
});
