import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { seedData } from '../../../database/seed';

export const jobsRouter = Router();

let jobs = [...seedData.jobs];

export function resetJobsStore() {
  jobs = JSON.parse(JSON.stringify(seedData.jobs));
}

export function getJobsStore() {
  return jobs;
}

// GET all jobs
jobsRouter.get('/', (req: Request, res: Response) => {
  const statusFilter = req.query.status as string;
  const filtered = statusFilter ? jobs.filter(j => j.status === statusFilter) : jobs;
  res.json({ success: true, count: filtered.length, data: filtered });
});

// POST create job
jobsRouter.post('/', (req: Request, res: Response) => {
  const {
    customerName,
    address,
    latitude,
    longitude,
    demandKg,
    demandM3,
    demandPieces,
    timeWindowStartSec,
    timeWindowEndSec,
    serviceDurationSec,
    requiredSkills,
    jobType
  } = req.body;

  if (!customerName || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, error: 'customerName, latitude, and longitude are required' });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ success: false, error: 'Coordinates out of WGS84 bounds' });
  }

  const newJob = {
    id: `job-${uuidv4().substring(0, 8)}`,
    trackingCode: `TRK-SEA-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName,
    address: address || 'Downtown Seattle',
    latitude: Number(latitude),
    longitude: Number(longitude),
    demandKg: Number(demandKg) || 10,
    demandM3: Number(demandM3) || 0.1,
    demandPieces: Number(demandPieces) || 1,
    timeWindowStartSec: Number(timeWindowStartSec) || 28800,
    timeWindowEndSec: Number(timeWindowEndSec) || 64800,
    serviceDurationSec: Number(serviceDurationSec) || 300,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    jobType: jobType === 'PICKUP' ? 'PICKUP' as const : 'DELIVERY' as const,
    status: 'PENDING' as const
  };

  jobs.push(newJob);
  res.status(201).json({ success: true, data: newJob });
});

// DELETE job
jobsRouter.delete('/:id', (req: Request, res: Response) => {
  const idx = jobs.findIndex(j => j.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }
  const deleted = jobs.splice(idx, 1)[0];
  res.json({ success: true, message: `Job ${deleted.trackingCode} removed` });
});
