/**
 * TimeZone & Date Line Calculation Engine
 * Handles multi-timezone itinerary scheduling, cross-date line journeys,
 * daylight saving adjustments, and schedule overlap detection.
 */

export interface TimeInterval {
  start: Date;
  end: Date;
}

export interface TransitLeg {
  departureTimeUtc: Date;
  departureTimezone: string;
  arrivalTimeUtc: Date;
  arrivalTimezone: string;
}

export class TimezoneCalculator {
  /**
   * Calculate inclusive days between two calendar dates
   */
  static getInclusiveDayCount(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date provided to getInclusiveDayCount');
    }

    if (end < start) {
      throw new Error('End date cannot be prior to start date');
    }

    // Use UTC midnight normalization to prevent DST hour shifts from altering day counts
    const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

    const diffDays = Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Inclusive of both start and end days
  }

  /**
   * Calculate actual elapsed transit duration in seconds between departure and arrival
   * irrespective of local time zone differences.
   */
  static calculateElapsedTransitSeconds(transit: TransitLeg): number {
    const depMs = transit.departureTimeUtc.getTime();
    const arrMs = transit.arrivalTimeUtc.getTime();

    if (isNaN(depMs) || isNaN(arrMs)) {
      throw new Error('Invalid transit timestamps');
    }

    const elapsedSeconds = Math.round((arrMs - depMs) / 1000);
    if (elapsedSeconds < 0) {
      throw new Error('Arrival time cannot precede departure time');
    }

    return elapsedSeconds;
  }

  /**
   * Determine if a journey crosses the International Date Line
   * based on coordinates or longitudinal displacement.
   */
  static isDateLineCrossed(originLon: number, destinationLon: number): boolean {
    if (originLon < -180 || originLon > 180 || destinationLon < -180 || destinationLon > 180) {
      throw new Error('Coordinates must be in range -180 to 180 degrees');
    }

    // A crossing occurs when traversing between Western (>0) and Eastern (<0) hemispheres
    // across the 180th meridian where the absolute distance across antimeridian is shorter than across Prime Meridian.
    const directDiff = Math.abs(destinationLon - originLon);
    const antimeridianDiff = 360 - directDiff;

    return antimeridianDiff < directDiff && Math.sign(originLon) !== Math.sign(destinationLon);
  }

  /**
   * Check if two scheduled items overlap on the same calendar day.
   */
  static doItemsOverlap(
    itemA: { startTime: Date | string; endTime: Date | string },
    itemB: { startTime: Date | string; endTime: Date | string }
  ): boolean {
    const aStart = new Date(itemA.startTime).getTime();
    const aEnd = new Date(itemA.endTime).getTime();
    const bStart = new Date(itemB.startTime).getTime();
    const bEnd = new Date(itemB.endTime).getTime();

    if (isNaN(aStart) || isNaN(aEnd) || isNaN(bStart) || isNaN(bEnd)) {
      return false;
    }

    return aStart < bEnd && bStart < aEnd;
  }

  /**
   * Format ISO string in specific IANA timezone (or UTC fallback)
   */
  static formatLocalTime(utcDate: Date | string, timezone: string): string {
    const d = new Date(utcDate);
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(d);
    } catch {
      // Fallback to UTC if timezone string is invalid
      return d.toISOString().substring(11, 16);
    }
  }
}
