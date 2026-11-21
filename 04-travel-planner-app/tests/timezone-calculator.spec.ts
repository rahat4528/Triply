import { TimezoneCalculator, TransitLeg } from '../integrations/timezone-calculator';

describe('TimezoneCalculator', () => {
  describe('getInclusiveDayCount', () => {
    it('returns 1 day for same start and end date', () => {
      const days = TimezoneCalculator.getInclusiveDayCount('2026-06-01T00:00:00.000Z', '2026-06-01T23:59:59.000Z');
      expect(days).toBe(1);
    });

    it('returns 8 days for standard trip span', () => {
      const days = TimezoneCalculator.getInclusiveDayCount('2026-10-10', '2026-10-17');
      expect(days).toBe(8);
    });

    it('handles leap year date spans accurately', () => {
      const days = TimezoneCalculator.getInclusiveDayCount('2028-02-28', '2028-03-01');
      expect(days).toBe(3); // Feb 28, Feb 29, Mar 1
    });

    it('throws error if end date precedes start date', () => {
      expect(() => {
        TimezoneCalculator.getInclusiveDayCount('2026-10-15', '2026-10-10');
      }).toThrow('End date cannot be prior to start date');
    });
  });

  describe('isDateLineCrossed', () => {
    it('detects antimeridian crossing from Tokyo (139.65) to San Francisco (-122.41)', () => {
      const crossed = TimezoneCalculator.isDateLineCrossed(139.6503, -122.4194);
      expect(crossed).toBe(true);
    });

    it('detects antimeridian crossing from Auckland (174.76) to Honolulu (-157.85)', () => {
      const crossed = TimezoneCalculator.isDateLineCrossed(174.7633, -157.8583);
      expect(crossed).toBe(true);
    });

    it('returns false for transatlantic flight from London (-0.12) to New York (-74.00)', () => {
      const crossed = TimezoneCalculator.isDateLineCrossed(-0.1278, -74.006);
      expect(crossed).toBe(false);
    });

    it('throws on out-of-bounds longitude values', () => {
      expect(() => {
        TimezoneCalculator.isDateLineCrossed(195.0, -120.0);
      }).toThrow('Coordinates must be in range -180 to 180 degrees');
    });
  });

  describe('calculateElapsedTransitSeconds', () => {
    it('accurately calculates flight duration across timezones', () => {
      const leg: TransitLeg = {
        departureTimeUtc: new Date('2026-10-10T01:00:00.000Z'),
        departureTimezone: 'America/Los_Angeles',
        arrivalTimeUtc: new Date('2026-10-10T11:30:00.000Z'),
        arrivalTimezone: 'Asia/Tokyo'
      };

      const seconds = TimezoneCalculator.calculateElapsedTransitSeconds(leg);
      expect(seconds).toBe(10.5 * 3600); // 10.5 hours = 37,800 seconds
    });

    it('throws error when arrival time precedes departure time', () => {
      const leg: TransitLeg = {
        departureTimeUtc: new Date('2026-10-10T12:00:00.000Z'),
        departureTimezone: 'UTC',
        arrivalTimeUtc: new Date('2026-10-10T10:00:00.000Z'),
        arrivalTimezone: 'UTC'
      };

      expect(() => {
        TimezoneCalculator.calculateElapsedTransitSeconds(leg);
      }).toThrow('Arrival time cannot precede departure time');
    });
  });

  describe('doItemsOverlap', () => {
    it('detects overlapping activities', () => {
      const itemA = { startTime: '2026-10-10T10:00:00.000Z', endTime: '2026-10-10T12:00:00.000Z' };
      const itemB = { startTime: '2026-10-10T11:30:00.000Z', endTime: '2026-10-10T13:30:00.000Z' };

      expect(TimezoneCalculator.doItemsOverlap(itemA, itemB)).toBe(true);
    });

    it('detects non-overlapping sequential activities', () => {
      const itemA = { startTime: '2026-10-10T10:00:00.000Z', endTime: '2026-10-10T12:00:00.000Z' };
      const itemB = { startTime: '2026-10-10T12:30:00.000Z', endTime: '2026-10-10T14:30:00.000Z' };

      expect(TimezoneCalculator.doItemsOverlap(itemA, itemB)).toBe(false);
    });
  });
});
