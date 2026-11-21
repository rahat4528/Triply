import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { seedData } from '../../../database/seed';

export const vehiclesRouter = Router();

let vehicles = [...seedData.vehicles];

export function resetVehiclesStore() {
  vehicles = JSON.parse(JSON.stringify(seedData.vehicles));
}

export function getVehiclesStore() {
  return vehicles;
}

// GET all vehicles
vehiclesRouter.get('/', (req: Request, res: Response) => {
  const drivers = seedData.drivers;
  const enriched = vehicles.map(v => {
    const drv = drivers.find(d => d.id === v.assignedDriverId);
    return {
      ...v,
      driverName: drv ? drv.name : 'Unassigned',
      driverPhone: drv ? drv.phone : undefined,
      driverSkills: drv ? drv.skills : []
    };
  });
  res.json({ success: true, count: enriched.length, data: enriched });
});

// GET single vehicle
vehiclesRouter.get('/:id', (req: Request, res: Response) => {
  const vehicle = vehicles.find(v => v.id === req.params.id);
  if (!vehicle) {
    return res.status(404).json({ success: false, error: 'Vehicle not found' });
  }
  res.json({ success: true, data: vehicle });
});

// POST create vehicle
vehiclesRouter.post('/', (req: Request, res: Response) => {
  const { code, name, vehicleType, capacityKg, capacityM3, capacityPieces, currentDepotId } = req.body;

  if (!code || !name) {
    return res.status(400).json({ success: false, error: 'code and name are required' });
  }

  const newVehicle = {
    id: `veh-${uuidv4().substring(0, 8)}`,
    code,
    name,
    vehicleType: vehicleType || 'VAN',
    capacityKg: Number(capacityKg) || 1000,
    capacityM3: Number(capacityM3) || 8.0,
    capacityPieces: Number(capacityPieces) || 50,
    currentDepotId: currentDepotId || 'depot-central-01',
    assignedDriverId: `drv-${uuidv4().substring(0, 8)}`,
    status: 'AVAILABLE' as const
  };

  vehicles.push(newVehicle);
  res.status(201).json({ success: true, data: newVehicle });
});
