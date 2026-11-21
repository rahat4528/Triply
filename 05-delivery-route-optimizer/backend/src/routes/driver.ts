import { Router, Request, Response } from 'express';
import { getRunsStore } from './optimize';

export const driverRouter = Router();

// GET active route for vehicle driver
driverRouter.get('/:vehicleId/route', (req: Request, res: Response) => {
  const vehicleId = req.params.vehicleId;
  const runs = getRunsStore();

  let targetRoute = null;
  for (const r of runs) {
    const route = r.routes?.find((rt: any) => rt.vehicleId === vehicleId);
    if (route) {
      targetRoute = route;
      break;
    }
  }

  if (!targetRoute) {
    return res.status(404).json({ success: false, error: `No active route found for vehicle ${vehicleId}` });
  }

  res.json({
    success: true,
    vehicleId,
    data: targetRoute
  });
});

// PATCH stop status
driverRouter.patch('/stops/:stopId/status', (req: Request, res: Response) => {
  const { stopId } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }

  const validStatuses = ['SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'DELIVERED', 'FAILED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status. Must be one of ${validStatuses.join(', ')}` });
  }

  let foundStop: any = null;
  const runs = getRunsStore();

  for (const run of runs) {
    for (const route of (run.routes || [])) {
      const stop = route.stops?.find((s: any) => s.jobId === stopId || String(s.sequence) === stopId);
      if (stop) {
        stop.deliveryStatus = status;
        if (notes) stop.notes = notes;
        foundStop = stop;
        break;
      }
    }
    if (foundStop) break;
  }

  if (!foundStop) {
    return res.status(404).json({ success: false, error: 'Stop not found' });
  }

  res.json({
    success: true,
    data: foundStop
  });
});
