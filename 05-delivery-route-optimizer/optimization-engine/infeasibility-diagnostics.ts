/**
 * Infeasibility Diagnostics Engine
 * Evaluates why jobs cannot be scheduled or why an optimization problem is infeasible.
 * Identifies capacity bottlenecks, skill incompatibilities, and time-space constraints.
 */

export interface DiagnosticJob {
  id: string;
  trackingCode: string;
  demandKg: number;
  demandM3: number;
  demandPieces: number;
  timeWindowStartSec: number;
  timeWindowEndSec: number;
  requiredSkills: string[];
}

export interface DiagnosticVehicle {
  id: string;
  code: string;
  capacityKg: number;
  capacityM3: number;
  capacityPieces: number;
  skills: string[];
}

export interface InfeasibilityReason {
  jobId: string;
  trackingCode: string;
  code: 'CAPACITY_EXCEEDED' | 'SKILL_MISSING' | 'TIME_WINDOW_TOO_NARROW';
  explanation: string;
}

export class InfeasibilityDiagnostics {
  /**
   * Pre-solve analysis to immediately detect inherently impossible jobs
   */
  static analyzePreSolve(jobs: DiagnosticJob[], vehicles: DiagnosticVehicle[]): InfeasibilityReason[] {
    const reasons: InfeasibilityReason[] = [];

    // Aggregate fleet maximums
    const maxFleetKg = Math.max(0, ...vehicles.map(v => v.capacityKg));
    const maxFleetM3 = Math.max(0, ...vehicles.map(v => v.capacityM3));
    const maxFleetPieces = Math.max(0, ...vehicles.map(v => v.capacityPieces));

    // Collect all unique available skills across all drivers/vehicles
    const availableSkills = new Set<string>();
    vehicles.forEach(v => v.skills.forEach(s => availableSkills.add(s)));

    for (const job of jobs) {
      // 1. Single job capacity exceeds any vehicle in fleet
      if (
        job.demandKg > maxFleetKg ||
        job.demandM3 > maxFleetM3 ||
        job.demandPieces > maxFleetPieces
      ) {
        reasons.push({
          jobId: job.id,
          trackingCode: job.trackingCode,
          code: 'CAPACITY_EXCEEDED',
          explanation: `Job demand (${job.demandKg}kg, ${job.demandM3}m3) exceeds the maximum single-vehicle capacity in fleet (${maxFleetKg}kg, ${maxFleetM3}m3).`
        });
        continue;
      }

      // 2. Job requires skill that no vehicle/driver possesses
      const missingSkills = job.requiredSkills.filter(s => !availableSkills.has(s));
      if (missingSkills.length > 0) {
        reasons.push({
          jobId: job.id,
          trackingCode: job.trackingCode,
          code: 'SKILL_MISSING',
          explanation: `Required skill(s) [${missingSkills.join(', ')}] are not possessed by any driver in the active fleet.`
        });
        continue;
      }

      // 3. Time window impossible (end <= start)
      if (job.timeWindowEndSec <= job.timeWindowStartSec) {
        reasons.push({
          jobId: job.id,
          trackingCode: job.trackingCode,
          code: 'TIME_WINDOW_TOO_NARROW',
          explanation: `Delivery time window start (${job.timeWindowStartSec}s) is equal to or later than end (${job.timeWindowEndSec}s).`
        });
      }
    }

    return reasons;
  }
}
