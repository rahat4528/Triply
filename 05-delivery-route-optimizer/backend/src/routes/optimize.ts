import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getVehiclesStore } from './vehicles';
import { getJobsStore } from './jobs';
import { seedData } from '../../../database/seed';
import { DistanceMatrixEngine } from '../../../optimization-engine/distance-matrix';
import { SolutionValidator, ValidationRoute } from '../../../optimization-engine/solution-validator';
import { InfeasibilityDiagnostics } from '../../../optimization-engine/infeasibility-diagnostics';

export const optimizeRouter = Router();

// In-memory runs store
let optimizationRuns: any[] = [];

export function resetRunsStore() {
  optimizationRuns = [];
}

export function getRunsStore() {
  return optimizationRuns;
}

// POST trigger optimization run
optimizeRouter.post('/', (req: Request, res: Response) => {
  const vehicles = getVehiclesStore();
  const jobs = getJobsStore();
  const depot = seedData.depots[0];

  // 1. Pre-solve diagnostics
  const diagnosticVehicles = vehicles.map(v => {
    const drv = seedData.drivers.find(d => d.id === v.assignedDriverId);
    return {
      id: v.id,
      code: v.code,
      capacityKg: v.capacityKg,
      capacityM3: v.capacityM3,
      capacityPieces: v.capacityPieces,
      skills: drv ? drv.skills : []
    };
  });

  const infeasibilityReasons = InfeasibilityDiagnostics.analyzePreSolve(jobs, diagnosticVehicles);

  // Filter schedulable jobs
  const unassignedIds = infeasibilityReasons.map(r => r.jobId);
  const schedulableJobs = jobs.filter(j => !unassignedIds.includes(j.id));

  // 2. Generate vehicle routes through deterministic heuristic partitioning
  const routes: any[] = [];
  const assignedJobIds: string[] = [];

  // Partition schedulable jobs among available vehicles
  const numVehicles = Math.min(vehicles.length, 3);
  let jobCursor = 0;

  for (let vIdx = 0; vIdx < numVehicles; vIdx++) {
    const veh = vehicles[vIdx];
    const vehJobs = schedulableJobs.filter((_, idx) => idx % numVehicles === vIdx);

    let routeDistanceMeters = 0;
    let currentSec = 28800; // 08:00 start at depot
    let lastLat = depot.latitude;
    let lastLon = depot.longitude;

    const stops: any[] = [
      {
        sequence: 1,
        stopType: 'START',
        jobId: undefined,
        arrivalSec: currentSec,
        departureSec: currentSec + 900, // 15 min depot prep
        location: [depot.longitude, depot.latitude],
        address: depot.address
      }
    ];

    currentSec += 900;

    for (let sIdx = 0; sIdx < vehJobs.length; sIdx++) {
      const j = vehJobs[sIdx];
      const dist = DistanceMatrixEngine.haversineDistanceMeters(lastLat, lastLon, j.latitude, j.longitude);
      const legMeters = Math.round(dist * 1.35);
      const transitSec = Math.round(legMeters / 11.11);

      currentSec += transitSec;
      // Wait if early
      const arrivalSec = Math.max(currentSec, j.timeWindowStartSec);
      const departureSec = arrivalSec + j.serviceDurationSec;
      currentSec = departureSec;

      stops.push({
        sequence: sIdx + 2,
        stopType: 'JOB',
        jobId: j.id,
        trackingCode: j.trackingCode,
        customerName: j.customerName,
        address: j.address,
        arrivalSec,
        departureSec,
        demandKg: j.demandKg,
        demandM3: j.demandM3,
        demandPieces: j.demandPieces,
        timeWindowStartSec: j.timeWindowStartSec,
        timeWindowEndSec: j.timeWindowEndSec,
        jobType: j.jobType,
        location: [j.longitude, j.latitude]
      });

      routeDistanceMeters += legMeters;
      lastLat = j.latitude;
      lastLon = j.longitude;
      assignedJobIds.push(j.id);
    }

    // Return to depot
    const returnDist = Math.round(DistanceMatrixEngine.haversineDistanceMeters(lastLat, lastLon, depot.latitude, depot.longitude) * 1.35);
    routeDistanceMeters += returnDist;
    currentSec += Math.round(returnDist / 11.11);

    stops.push({
      sequence: stops.length + 1,
      stopType: 'END',
      jobId: undefined,
      arrivalSec: currentSec,
      departureSec: currentSec,
      location: [depot.longitude, depot.latitude],
      address: depot.address
    });

    routes.push({
      id: `route-${vIdx + 1}`,
      vehicleId: veh.id,
      vehicleCode: veh.code,
      vehicleName: veh.name,
      totalDistanceMeters: routeDistanceMeters,
      totalDurationSeconds: currentSec - 28800,
      stops
    });
  }

  // 3. Solution Validator
  const validationRoutes: ValidationRoute[] = routes.map((r, i) => {
    const veh = vehicles[i];
    return {
      vehicleId: veh.id,
      maxCapacityKg: veh.capacityKg,
      maxCapacityM3: veh.capacityM3,
      maxCapacityPieces: veh.capacityPieces,
      maxShiftSeconds: 32400,
      stops: r.stops
    };
  });

  const validationReport = SolutionValidator.validate(validationRoutes);

  const totalDistanceMeters = routes.reduce((acc, r) => acc + r.totalDistanceMeters, 0);
  const totalDurationSeconds = routes.reduce((acc, r) => acc + r.totalDurationSeconds, 0);

  const runRecord = {
    id: `run-${uuidv4().substring(0, 8)}`,
    status: 'COMPLETED',
    objectiveValue: totalDurationSeconds + totalDistanceMeters * 0.05,
    totalDistanceMeters,
    totalDurationSeconds,
    totalJobsAssigned: assignedJobIds.length,
    totalJobsUnassigned: unassignedIds.length,
    routes,
    unassignedJobs: infeasibilityReasons,
    validationReport,
    version: 1,
    createdAt: new Date().toISOString()
  };

  optimizationRuns.push(runRecord);

  res.status(201).json({
    success: true,
    data: runRecord
  });
});

// GET all optimization runs
optimizeRouter.get('/runs', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: optimizationRuns.length,
    data: optimizationRuns.map(r => ({
      id: r.id,
      status: r.status,
      totalDistanceKm: (r.totalDistanceMeters / 1000).toFixed(1),
      totalDurationHours: (r.totalDurationSeconds / 3600).toFixed(1),
      totalJobsAssigned: r.totalJobsAssigned,
      totalJobsUnassigned: r.totalJobsUnassigned,
      isValid: r.validationReport?.isValid ?? true,
      version: r.version,
      createdAt: r.createdAt
    }))
  });
});

// GET single run details
optimizeRouter.get('/runs/:id', (req: Request, res: Response) => {
  const run = optimizationRuns.find(r => r.id === req.params.id);
  if (!run) {
    return res.status(404).json({ success: false, error: 'Optimization run not found' });
  }
  res.json({ success: true, data: run });
});

// POST dispatch run with optimistic locking
optimizeRouter.post('/runs/:id/dispatch', (req: Request, res: Response) => {
  const run = optimizationRuns.find(r => r.id === req.params.id);
  if (!run) {
    return res.status(404).json({ success: false, error: 'Optimization run not found' });
  }

  const clientVersion = req.body.version;
  if (clientVersion !== undefined && clientVersion !== run.version) {
    return res.status(409).json({
      success: false,
      error: 'Conflict: Run has been updated by another dispatcher',
      currentVersion: run.version
    });
  }

  if (run.status === 'DISPATCHED') {
    return res.status(400).json({ success: false, error: 'Run is already dispatched' });
  }

  run.status = 'DISPATCHED';
  run.version += 1;

  res.json({
    success: true,
    message: 'Run successfully dispatched to fleet drivers',
    status: run.status,
    version: run.version
  });
});
