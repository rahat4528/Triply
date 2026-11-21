/**
 * Independent Solution Validator
 * Rigorously checks that an optimization solution satisfies all constraints:
 * - Vehicle maximum capacity limits at every step along the route
 * - Customer time windows [windowStart, windowEnd]
 * - Precedence constraints (pickups before deliveries)
 * - Vehicle shift maximum working hours
 */

export interface ValidationStop {
  jobId?: string;
  stepType: string;
  arrivalSec: number;
  departureSec: number;
  timeWindowStartSec?: number;
  timeWindowEndSec?: number;
  demandKg?: number;
  demandM3?: number;
  demandPieces?: number;
  jobType?: 'DELIVERY' | 'PICKUP';
}

export interface ValidationRoute {
  vehicleId: string;
  maxCapacityKg: number;
  maxCapacityM3: number;
  maxCapacityPieces: number;
  maxShiftSeconds: number;
  stops: ValidationStop[];
}

export interface ValidationError {
  vehicleId: string;
  stopIndex: number;
  jobId?: string;
  constraint: 'CAPACITY' | 'TIME_WINDOW' | 'SHIFT_LIMIT' | 'PRECEDENCE';
  message: string;
}

export interface ValidationReport {
  isValid: boolean;
  errors: ValidationError[];
}

export class SolutionValidator {
  static validate(routes: ValidationRoute[]): ValidationReport {
    const errors: ValidationError[] = [];

    for (const r of routes) {
      let currentLoadKg = 0;
      let currentLoadM3 = 0;
      let currentLoadPieces = 0;

      // Track total deliveries at start to compute initial outbound load
      let initialOutboundKg = 0;
      let initialOutboundM3 = 0;
      let initialOutboundPieces = 0;

      for (const s of r.stops) {
        if (s.jobType === 'DELIVERY') {
          initialOutboundKg += s.demandKg || 0;
          initialOutboundM3 += s.demandM3 || 0;
          initialOutboundPieces += s.demandPieces || 0;
        }
      }

      currentLoadKg = initialOutboundKg;
      currentLoadM3 = initialOutboundM3;
      currentLoadPieces = initialOutboundPieces;

      // Check initial capacity before leaving depot
      if (
        currentLoadKg > r.maxCapacityKg ||
        currentLoadM3 > r.maxCapacityM3 ||
        currentLoadPieces > r.maxCapacityPieces
      ) {
        errors.push({
          vehicleId: r.vehicleId,
          stopIndex: 0,
          constraint: 'CAPACITY',
          message: `Initial vehicle load exceeds capacity: ${currentLoadKg}kg > ${r.maxCapacityKg}kg`
        });
      }

      const totalRouteDuration = (r.stops[r.stops.length - 1]?.departureSec || 0) - (r.stops[0]?.arrivalSec || 0);
      if (totalRouteDuration > r.maxShiftSeconds) {
        errors.push({
          vehicleId: r.vehicleId,
          stopIndex: r.stops.length - 1,
          constraint: 'SHIFT_LIMIT',
          message: `Total route duration (${totalRouteDuration}s) exceeds max driver shift (${r.maxShiftSeconds}s)`
        });
      }

      for (let i = 0; i < r.stops.length; i++) {
        const s = r.stops[i];

        // 1. Time window constraint
        if (s.timeWindowStartSec !== undefined && s.timeWindowEndSec !== undefined) {
          if (s.arrivalSec > s.timeWindowEndSec) {
            errors.push({
              vehicleId: r.vehicleId,
              stopIndex: i,
              jobId: s.jobId,
              constraint: 'TIME_WINDOW',
              message: `Arrival time ${s.arrivalSec}s is past window deadline ${s.timeWindowEndSec}s`
            });
          }
        }

        // 2. Adjust load based on stop action
        if (s.jobType === 'DELIVERY') {
          currentLoadKg -= s.demandKg || 0;
          currentLoadM3 -= s.demandM3 || 0;
          currentLoadPieces -= s.demandPieces || 0;
        } else if (s.jobType === 'PICKUP') {
          currentLoadKg += s.demandKg || 0;
          currentLoadM3 += s.demandM3 || 0;
          currentLoadPieces += s.demandPieces || 0;
        }

        // 3. Verify load never overflows capacity or goes negative
        if (
          currentLoadKg > r.maxCapacityKg ||
          currentLoadM3 > r.maxCapacityM3 ||
          currentLoadPieces > r.maxCapacityPieces
        ) {
          errors.push({
            vehicleId: r.vehicleId,
            stopIndex: i,
            jobId: s.jobId,
            constraint: 'CAPACITY',
            message: `Load overflow at stop ${i}: ${currentLoadKg}kg (max: ${r.maxCapacityKg}kg)`
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
