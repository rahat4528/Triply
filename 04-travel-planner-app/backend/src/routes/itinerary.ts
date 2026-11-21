import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getTripsStore } from './trips';
import { TimezoneCalculator } from '../../../integrations/timezone-calculator';

export const itineraryRouter = Router({ mergeParams: true });

// GET full itinerary for trip
itineraryRouter.get('/', (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  res.json({
    success: true,
    tripId,
    days: trip.days
  });
});

// POST add an itinerary item
itineraryRouter.post('/items', (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const { dayId, title, itemType, startTime, endTime, timezone, latitude, longitude, locationName, costMinor, currency, bookingReference, notes } = req.body;

  if (!dayId || !title) {
    return res.status(400).json({ success: false, error: 'dayId and title are required' });
  }

  const day = trip.days.find(d => d.id === dayId);
  if (!day) {
    return res.status(404).json({ success: false, error: 'Itinerary day not found' });
  }

  // Check for overlap warning
  let hasOverlap = false;
  if (startTime && endTime) {
    hasOverlap = day.items.some(existing => {
      if (!existing.startTime || !existing.endTime) return false;
      return TimezoneCalculator.doItemsOverlap(
        { startTime, endTime },
        { startTime: existing.startTime, endTime: existing.endTime }
      );
    });
  }

  const newItem = {
    id: `item-${uuidv4().substring(0, 8)}`,
    title,
    itemType: itemType || 'ACTIVITY',
    startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date(Date.now() + 3600000).toISOString(),
    timezone: timezone || 'UTC',
    latitude: typeof latitude === 'number' ? latitude : 0,
    longitude: typeof longitude === 'number' ? longitude : 0,
    locationName: locationName || '',
    costMinor: Number(costMinor) || 0,
    currency: currency || trip.baseCurrency,
    bookingReference: bookingReference || undefined,
    notes: notes || undefined
  };

  day.items.push(newItem);

  res.status(201).json({
    success: true,
    data: newItem,
    warning: hasOverlap ? 'Item overlaps with an existing scheduled activity on this day' : undefined
  });
});

// DELETE itinerary item
itineraryRouter.delete('/items/:itemId', (req: Request, res: Response) => {
  const { tripId, itemId } = req.params;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  let found = false;
  for (const day of trip.days) {
    const idx = day.items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      day.items.splice(idx, 1);
      found = true;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ success: false, error: 'Itinerary item not found' });
  }

  res.json({ success: true, message: 'Item deleted' });
});
