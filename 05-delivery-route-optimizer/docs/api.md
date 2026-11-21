# Delivery Route Optimizer - API Specification

## 1. Overview
Base URL: `/api/v1`
Protocol: HTTP/1.1 REST
Content-Type: `application/json`

## 2. Endpoints

### 2.1 Fleet & Vehicles
- `GET /api/v1/vehicles`
  - Returns fleet inventory, capacity dimensions, status, and assigned drivers.
- `POST /api/v1/vehicles`
  - Register new vehicle.
  - Body: `{ code, name, vehicleType, capacityKg, capacityM3, capacityPieces, skills }`
- `GET /api/v1/vehicles/:id`
  - Get vehicle details and active route.

### 2.2 Delivery Jobs
- `GET /api/v1/jobs`
  - List delivery and pickup jobs with filters for status and date.
- `POST /api/v1/jobs`
  - Create a new delivery/pickup job.
  - Body: `{ customerName, address, latitude, longitude, demandKg, demandM3, demandPieces, timeWindowStart, timeWindowEnd, serviceDurationSec, requiredSkills, jobType }`
- `DELETE /api/v1/jobs/:id`
  - Remove job from unassigned pool.

### 2.3 Optimization Runs
- `POST /api/v1/optimize`
  - Trigger multi-vehicle VRP solver run.
  - Body: `{ vehicleIds: string[], jobIds: string[], objective: "MINIMIZE_TIME" | "MINIMIZE_DISTANCE" }`
  - Returns run details, assigned routes, and unassigned diagnostics.
- `GET /api/v1/optimize/runs`
  - List historical optimization runs with efficiency metrics.
- `GET /api/v1/optimize/runs/:id`
  - Get full run details, vehicle route stops, and validation report.
- `POST /api/v1/optimize/runs/:id/dispatch`
  - Dispatch and lock an optimization run (Optimistic concurrency check).

### 2.4 Driver Manifest & Route Execution
- `GET /api/v1/driver/:vehicleId/route`
  - Driver mobile view of active route with ordered stops and package details.
- `PATCH /api/v1/driver/stops/:stopId/status`
  - Transition stop status.
  - Body: `{ status: "EN_ROUTE" | "ARRIVED" | "DELIVERED" | "FAILED", notes: string }`
