import { InfeasibilityDiagnostics, DiagnosticJob, DiagnosticVehicle } from '../optimization-engine/infeasibility-diagnostics';

describe('InfeasibilityDiagnostics', () => {
  const fleet: DiagnosticVehicle[] = [
    {
      id: 'veh-01',
      code: 'VAN-01',
      capacityKg: 1000,
      capacityM3: 8.0,
      capacityPieces: 50,
      skills: ['REFRIGERATED']
    }
  ];

  it('flags job exceeding max fleet capacity', () => {
    const jobs: DiagnosticJob[] = [
      {
        id: 'job-giant',
        trackingCode: 'TRK-9901',
        demandKg: 2500, // Fleet max is 1000kg
        demandM3: 2.0,
        demandPieces: 5,
        timeWindowStartSec: 28800,
        timeWindowEndSec: 36000,
        requiredSkills: []
      }
    ];

    const reasons = InfeasibilityDiagnostics.analyzePreSolve(jobs, fleet);
    expect(reasons).toHaveLength(1);
    expect(reasons[0].code).toBe('CAPACITY_EXCEEDED');
    expect(reasons[0].jobId).toBe('job-giant');
  });

  it('flags job requiring unavailable driver skill', () => {
    const jobs: DiagnosticJob[] = [
      {
        id: 'job-hazmat',
        trackingCode: 'TRK-9902',
        demandKg: 50,
        demandM3: 0.5,
        demandPieces: 2,
        timeWindowStartSec: 28800,
        timeWindowEndSec: 36000,
        requiredSkills: ['HAZMAT'] // Fleet only has 'REFRIGERATED'
      }
    ];

    const reasons = InfeasibilityDiagnostics.analyzePreSolve(jobs, fleet);
    expect(reasons).toHaveLength(1);
    expect(reasons[0].code).toBe('SKILL_MISSING');
    expect(reasons[0].explanation).toContain('HAZMAT');
  });

  it('flags job with invalid time window', () => {
    const jobs: DiagnosticJob[] = [
      {
        id: 'job-bad-time',
        trackingCode: 'TRK-9903',
        demandKg: 50,
        demandM3: 0.5,
        demandPieces: 2,
        timeWindowStartSec: 36000,
        timeWindowEndSec: 30000, // end precedes start
        requiredSkills: []
      }
    ];

    const reasons = InfeasibilityDiagnostics.analyzePreSolve(jobs, fleet);
    expect(reasons).toHaveLength(1);
    expect(reasons[0].code).toBe('TIME_WINDOW_TOO_NARROW');
  });
});
