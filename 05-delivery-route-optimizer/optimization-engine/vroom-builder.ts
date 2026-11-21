/**
 * VROOM Optimization Protocol Request Builder
 * Translates fleet vehicles, depots, and customer delivery jobs
 * into standard VROOM JSON solver payload format.
 */

export interface VehicleInput {
  id: string;
  depotLat: number;
  depotLon: number;
  capacityKg: number;
  capacityM3: number;
  capacityPieces: number;
  timeWindowStartSec?: number;
  timeWindowEndSec?: number;
  skills?: string[];
}

export interface JobInput {
  id: string;
  latitude: number;
  longitude: number;
  demandKg: number;
  demandM3: number;
  demandPieces: number;
  timeWindowStartSec: number;
  timeWindowEndSec: number;
  serviceDurationSec: number;
  requiredSkills?: string[];
  jobType: 'DELIVERY' | 'PICKUP';
}

export interface VroomPayload {
  vehicles: Array<{
    id: number;
    start: [number, number]; // [lon, lat] per GeoJSON / VROOM standard
    end: [number, number];
    capacity: number[]; // [kg, dm3, pieces]
    time_window?: [number, number];
    skills?: number[];
    description: string;
  }>;
  jobs: Array<{
    id: number;
    location: [number, number]; // [lon, lat]
    delivery?: number[];
    pickup?: number[];
    service: number;
    time_windows: Array<[number, number]>;
    skills?: number[];
    description: string;
  }>;
}

export class VroomRequestBuilder {
  // Skill string to integer dictionary
  private skillMap: Map<string, number> = new Map();
  private nextSkillId = 1;

  getSkillId(skill: string): number {
    if (!this.skillMap.has(skill)) {
      this.skillMap.set(skill, this.nextSkillId++);
    }
    return this.skillMap.get(skill)!;
  }

  buildPayload(vehicles: VehicleInput[], jobs: JobInput[]): VroomPayload {
    const vroomVehicles = vehicles.map((v, index) => {
      const skillsInt = (v.skills || []).map(s => this.getSkillId(s));
      // Multi-dimensional capacity: [kg, liters/dm3, pieces]
      const capacityVector = [
        Math.round(v.capacityKg),
        Math.round(v.capacityM3 * 1000), // convert m3 to dm3 (liters) for integer representation
        Math.round(v.capacityPieces)
      ];

      return {
        id: index + 1,
        start: [v.depotLon, v.depotLat] as [number, number],
        end: [v.depotLon, v.depotLat] as [number, number],
        capacity: capacityVector,
        time_window: (v.timeWindowStartSec !== undefined && v.timeWindowEndSec !== undefined)
          ? [v.timeWindowStartSec, v.timeWindowEndSec] as [number, number]
          : undefined,
        skills: skillsInt.length > 0 ? skillsInt : undefined,
        description: v.id
      };
    });

    const vroomJobs = jobs.map((j, index) => {
      const requiredSkillsInt = (j.requiredSkills || []).map(s => this.getSkillId(s));
      const demandVector = [
        Math.round(j.demandKg),
        Math.round(j.demandM3 * 1000),
        Math.round(j.demandPieces)
      ];

      const jobRecord: any = {
        id: index + 1,
        location: [j.longitude, j.latitude] as [number, number],
        service: j.serviceDurationSec,
        time_windows: [[j.timeWindowStartSec, j.timeWindowEndSec]],
        description: j.id
      };

      if (j.jobType === 'PICKUP') {
        jobRecord.pickup = demandVector;
      } else {
        jobRecord.delivery = demandVector;
      }

      if (requiredSkillsInt.length > 0) {
        jobRecord.skills = requiredSkillsInt;
      }

      return jobRecord;
    });

    return {
      vehicles: vroomVehicles,
      jobs: vroomJobs
    };
  }
}
