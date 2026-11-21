import { SolutionValidator, ValidationRoute } from '../optimization-engine/solution-validator';

describe('SolutionValidator', () => {
  it('validates a compliant route successfully', () => {
    const routes: ValidationRoute[] = [
      {
        vehicleId: 'veh-01',
        maxCapacityKg: 1000,
        maxCapacityM3: 8.0,
        maxCapacityPieces: 50,
        maxShiftSeconds: 32400,
        stops: [
          {
            stepType: 'START',
            arrivalSec: 28800,
            departureSec: 29400
          },
          {
            jobId: 'job-01',
            stepType: 'JOB',
            jobType: 'DELIVERY',
            demandKg: 200,
            demandM3: 1.5,
            demandPieces: 10,
            arrivalSec: 30000,
            departureSec: 30600,
            timeWindowStartSec: 28800,
            timeWindowEndSec: 32400
          },
          {
            stepType: 'END',
            arrivalSec: 32000,
            departureSec: 32000
          }
        ]
      }
    ];

    const report = SolutionValidator.validate(routes);
    expect(report.isValid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it('detects capacity overflow at vehicle start', () => {
    const routes: ValidationRoute[] = [
      {
        vehicleId: 'veh-01',
        maxCapacityKg: 500, // Small van
        maxCapacityM3: 4.0,
        maxCapacityPieces: 20,
        maxShiftSeconds: 32400,
        stops: [
          {
            stepType: 'START',
            arrivalSec: 28800,
            departureSec: 29400
          },
          {
            jobId: 'job-heavy',
            stepType: 'JOB',
            jobType: 'DELIVERY',
            demandKg: 800, // Exceeds 500kg
            demandM3: 2.0,
            demandPieces: 5,
            arrivalSec: 30000,
            departureSec: 30600
          }
        ]
      }
    ];

    const report = SolutionValidator.validate(routes);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.constraint === 'CAPACITY')).toBe(true);
  });

  it('detects time window violation when vehicle arrives late', () => {
    const routes: ValidationRoute[] = [
      {
        vehicleId: 'veh-01',
        maxCapacityKg: 1000,
        maxCapacityM3: 8.0,
        maxCapacityPieces: 50,
        maxShiftSeconds: 32400,
        stops: [
          {
            stepType: 'START',
            arrivalSec: 28800,
            departureSec: 29400
          },
          {
            jobId: 'job-urgent',
            stepType: 'JOB',
            jobType: 'DELIVERY',
            demandKg: 50,
            arrivalSec: 36000, // 10:00:00
            departureSec: 36600,
            timeWindowStartSec: 28800,
            timeWindowEndSec: 32400 // Deadline was 09:00:00
          }
        ]
      }
    ];

    const report = SolutionValidator.validate(routes);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.constraint === 'TIME_WINDOW')).toBe(true);
  });

  it('detects driver shift limit exceeded', () => {
    const routes: ValidationRoute[] = [
      {
        vehicleId: 'veh-01',
        maxCapacityKg: 1000,
        maxCapacityM3: 8.0,
        maxCapacityPieces: 50,
        maxShiftSeconds: 28800, // 8 hours max
        stops: [
          {
            stepType: 'START',
            arrivalSec: 28800, // 08:00
            departureSec: 28800
          },
          {
            stepType: 'END',
            arrivalSec: 64800, // 18:00 (10 hours total)
            departureSec: 64800
          }
        ]
      }
    ];

    const report = SolutionValidator.validate(routes);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.constraint === 'SHIFT_LIMIT')).toBe(true);
  });
});
