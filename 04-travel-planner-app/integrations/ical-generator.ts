/**
 * RFC 5545 Compliant iCalendar Generator
 * Produces valid .ics calendar feeds for trip itineraries,
 * supporting VEVENT, stable UIDs, geographic coordinates, and timezones.
 */

export interface CalendarEvent {
  uid: string;
  title: string;
  description?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  startTime: Date | string;
  endTime?: Date | string;
  timezone?: string;
}

export class ICalGenerator {
  /**
   * Format Date object to RFC 5545 UTC timestamp (YYYYMMDDTHHMMSSZ)
   */
  static formatUtc(dateInput: Date | string): string {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date provided to formatUtc');
    }

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    return (
      d.getUTCFullYear().toString() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z'
    );
  }

  /**
   * Escape special characters in text fields per RFC 5545 section 3.3.11
   */
  static escapeText(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  /**
   * Fold lines longer than 75 octets per RFC 5545 section 3.1
   */
  static foldLine(line: string): string {
    if (line.length <= 75) {
      return line;
    }
    const parts: string[] = [];
    let remaining = line;

    parts.push(remaining.substring(0, 75));
    remaining = remaining.substring(75);

    while (remaining.length > 74) {
      parts.push(' ' + remaining.substring(0, 74));
      remaining = remaining.substring(74);
    }

    if (remaining.length > 0) {
      parts.push(' ' + remaining);
    }

    return parts.join('\r\n');
  }

  /**
   * Build complete RFC 5545 VCALENDAR document
   */
  static generateCalendar(calendarName: string, events: CalendarEvent[]): string {
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Triply//Travel Planner 1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      this.foldLine(`X-WR-CALNAME:${this.escapeText(calendarName)}`)
    ];

    const nowUtc = this.formatUtc(new Date());

    for (const ev of events) {
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${ev.uid}`);
      lines.push(`DTSTAMP:${nowUtc}`);
      lines.push(`DTSTART:${this.formatUtc(ev.startTime)}`);

      if (ev.endTime) {
        lines.push(`DTEND:${this.formatUtc(ev.endTime)}`);
      } else {
        // If no end time, default to 1 hour after start
        const defaultEnd = new Date(new Date(ev.startTime).getTime() + 3600000);
        lines.push(`DTEND:${this.formatUtc(defaultEnd)}`);
      }

      lines.push(this.foldLine(`SUMMARY:${this.escapeText(ev.title)}`));

      if (ev.description) {
        lines.push(this.foldLine(`DESCRIPTION:${this.escapeText(ev.description)}`));
      }

      if (ev.locationName) {
        lines.push(this.foldLine(`LOCATION:${this.escapeText(ev.locationName)}`));
      }

      if (typeof ev.latitude === 'number' && typeof ev.longitude === 'number') {
        lines.push(`GEO:${ev.latitude.toFixed(6)};${ev.longitude.toFixed(6)}`);
      }

      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }
}
