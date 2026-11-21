import { ICalGenerator, CalendarEvent } from '../integrations/ical-generator';

describe('ICalGenerator', () => {
  it('formats Date to RFC 5545 UTC timestamp', () => {
    const formatted = ICalGenerator.formatUtc(new Date('2026-10-10T14:30:00.000Z'));
    expect(formatted).toBe('20261010T143000Z');
  });

  it('escapes special characters properly', () => {
    const text = 'Visit, explore; see \\ taste\nnew things';
    const escaped = ICalGenerator.escapeText(text);
    expect(escaped).toBe('Visit\\, explore\\; see \\\\ taste\\nnew things');
  });

  it('folds lines longer than 75 characters', () => {
    const longSummary = 'SUMMARY:This is an exceptionally long calendar event summary designed to test RFC 5545 line folding at 75 octets';
    const folded = ICalGenerator.foldLine(longSummary);
    expect(folded).toContain('\r\n ');
    const lines = folded.split('\r\n');
    expect(lines[0].length).toBeLessThanOrEqual(75);
  });

  it('generates a valid VCALENDAR with VEVENT and GEO coordinate tags', () => {
    const events: CalendarEvent[] = [
      {
        uid: 'item-01-01@triply.travel',
        title: 'Senso-ji Temple Walk',
        description: 'Explore historic Nakamise street',
        locationName: 'Asakusa, Tokyo',
        latitude: 35.7148,
        longitude: 139.7967,
        startTime: '2026-10-11T08:30:00.000Z',
        endTime: '2026-10-11T11:00:00.000Z'
      }
    ];

    const ics = ICalGenerator.generateCalendar('Japan Trip 2026', events);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Triply//Travel Planner 1.0//EN');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:item-01-01@triply.travel');
    expect(ics).toContain('DTSTART:20261011T083000Z');
    expect(ics).toContain('DTEND:20261011T110000Z');
    expect(ics).toContain('SUMMARY:Senso-ji Temple Walk');
    expect(ics).toContain('GEO:35.714800;139.796700');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });
});
