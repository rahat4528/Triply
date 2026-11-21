import { Router, Request, Response } from 'express';
import { getTripsStore } from './trips';
import { ICalGenerator, CalendarEvent } from '../../../integrations/ical-generator';

export const calendarRouter = Router({ mergeParams: true });

// GET trip calendar feed in RFC 5545 iCalendar format
calendarRouter.get('/calendar.ics', (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const events: CalendarEvent[] = [];

  for (const day of trip.days) {
    for (const item of day.items) {
      events.push({
        uid: `${item.id}@triply.travel`,
        title: item.title,
        description: item.notes || `Activity on Day ${day.dayNumber}`,
        locationName: item.locationName,
        latitude: item.latitude,
        longitude: item.longitude,
        startTime: item.startTime,
        endTime: item.endTime,
        timezone: item.timezone
      });
    }
  }

  const icsContent = ICalGenerator.generateCalendar(trip.title, events);

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${trip.id}.ics"`);
  res.send(icsContent);
});
