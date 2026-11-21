/**
 * VROOM Response Parser
 * Transforms VROOM solver JSON into structured business routes,
 * calculating metrics, stop order, arrival/departure schedules, and unassigned lists.
 */

export interface ParsedStep {
  sequence: number;
  stepType: 'start' | 'job' | 'end';
  jobId?: string;
  arrivalSec: number;
  departureSec: number;
  durationSec: number;
  distanceMeters: number;
  loadKg: number;
  loadM3: number;
  loadPieces: number;
  location: [number, number]; // [lon, lat]
}

export interface ParsedRoute {
  vehicleId: string;
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  cost: number;
  steps: ParsedStep[];
}

export interface ParsedSolution {
  code: number;
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  totalCost: number;
  routes: ParsedRoute[];
  unassignedJobIds: string[];
}

export class VroomResponseParser {
  static parse(vroomJson: any, vehicleIdMap: Map<number, string>, jobIdMap: Map<number, string>): ParsedSolution {
    if (!vroomJson || typeof vroomJson.code !== 'number') {
      throw new Error('Invalid VROOM response format');
    }

    const summary = vroomJson.summary || {};
    const unassignedJobIds: string[] = [];

    if (Array.isArray(vroomJson.unassigned)) {
      for (const u of vroomJson.unassigned) {
        const originalId = jobIdMap.get(u.id) || u.description || String(u.id);
        unassignedJobIds.push(originalId);
      }
    }

    const routes: ParsedRoute[] = [];

    if (Array.isArray(vroomJson.routes)) {
      for (const r of vroomJson.routes) {
        const vehicleId = vehicleIdMap.get(r.vehicle) || r.description || String(r.vehicle);
        const steps: ParsedStep[] = [];

        if (Array.isArray(r.steps)) {
          r.steps.forEach((s: any, idx: number) => {
            const loadKg = Array.isArray(s.load) && s.load[0] !== undefined ? s.load[0] : 0;
            const loadM3 = Array.isArray(s.load) && s.load[1] !== undefined ? s.load[1] / 1000 : 0;
            const loadPieces = Array.isArray(s.load) && s.load[2] !== undefined ? s.load[2] : 0;

            steps.push({
              sequence: idx + 1,
              stepType: s.type || 'job',
              jobId: s.type === 'job' ? (jobIdMap.get(s.id) || s.description || String(s.id)) : undefined,
              arrivalSec: s.arrival || 0,
              departureSec: (s.arrival || 0) + (s.service || 0),
              durationSec: s.duration || 0,
              distanceMeters: s.distance || 0,
              loadKg,
              loadM3,
              loadPieces,
              location: s.location || [0, 0]
            });
          });
        }

        routes.push({
          vehicleId,
          totalDistanceMeters: r.distance || 0,
          totalDurationSeconds: r.duration || 0,
          cost: r.cost || 0,
          steps
        });
      }
    }

    return {
      code: vroomJson.code,
      totalDistanceMeters: summary.distance || 0,
      totalDurationSeconds: summary.duration || 0,
      totalCost: summary.cost || 0,
      routes,
      unassignedJobIds
    };
  }
}
