# Delivery Route Optimizer - Architecture Specification

## 1. System Overview
The Delivery Route Optimizer is designed around a decoupled, pipeline-based optimization architecture.

```
+-----------------------------------------------------------+
|               Dispatcher Control Tower UI                 |
|  (Fleet Panel, Orders Table, Interactive Route Map, Run   |
|   Comparison, Driver Mobile Manifest)                     |
+-----------------------------------------------------------+
                             | REST & JSON
                             v
+-----------------------------------------------------------+
|                 Express / Node.js Backend                 |
|  +---------------------+  +----------------------------+  |
|  | Fleet & Jobs Service|  | VROOM Protocol Builder     |  |
|  +---------------------+  +----------------------------+  |
|  +---------------------+  +----------------------------+  |
|  | Distance Matrix Calc|  | Solution Validator Engine  |  |
|  +---------------------+  +----------------------------+  |
|  +---------------------+  +----------------------------+  |
|  | Infeasibility Diag  |  | Dispatch Concurrency Guard |  |
|  +---------------------+  +----------------------------+  |
+-----------------------------------------------------------+
        |                           |                 |
        v                           v                 v
+------------------+       +-----------------+  +------------+
| PostgreSQL /     |       | VROOM Engine    |  | OSRM       |
| Prisma ORM       |       | (C++ / Docker)  |  | Routing    |
| triply_route_    |       | Solver Service  |  | Service    |
| optimizer_db     |       +-----------------+  +------------+
+------------------+
```

## 2. Core Modules

### 2.1 VROOM Request Builder (`optimization-engine/vroom-builder.ts`)
Converts database vehicles, depots, jobs, and shipments into standard VROOM JSON format:
- `vehicles`: id, start (coords), end (coords), capacity (vector of integers), time_window, skills.
- `jobs`: id, location, delivery (vector), pickup (vector), service, time_windows, skills.
- `shipments`: pickup (job), delivery (job).

### 2.2 VROOM Response Parser (`optimization-engine/vroom-parser.ts`)
Transforms VROOM solver output JSON into structured business routes:
- Maps `routes[].steps` to sequence numbers, arrival/departure timestamps, cumulative load, and driving legs.
- Captures `unassigned` jobs with reported reason codes.

### 2.3 Independent Solution Validator (`optimization-engine/solution-validator.ts`)
Validates candidate solutions independently:
- **Capacity Constraint**: At step $i$, $\sum \text{pickup} - \sum \text{delivery} \le \text{Capacity}_{\max}$.
- **Time Window Constraint**: Arrival time $t_i + \text{service}_i \le \text{window\_end}_i$.
- **Precedence Constraint**: For any shipment $S$, $\text{index}(\text{pickup}_S) < \text{index}(\text{delivery}_S)$ with same vehicle.

### 2.4 Infeasibility Diagnostics (`optimization-engine/infeasibility-diagnostics.ts`)
Analyzes why unassigned jobs failed to fit:
- Fleet capacity deficit vs total required demand.
- Driver skill mismatches.
- Temporal reachability bottlenecks.

### 2.5 Distance Matrix Engine (`optimization-engine/distance-matrix.ts`)
Computes distance ($m$) and duration ($s$) matrices using OSRM HTTP endpoint or geodesic Haversine calculations when running in development/fixture mode.

## 3. Database Schema Overview
Database: `triply_route_optimizer_db`
- `Depot`: Base terminal location.
- `Vehicle`: Vehicle record, multi-dimensional capacities, assigned driver.
- `Driver`: Profile, qualifications/skills, shift hours.
- `DeliveryJob`: Customer stop, coordinates, delivery/pickup load, time windows, skills.
- `OptimizationRun`: Optimization execution history, objective value, status, total distance, total duration.
- `OptimizedRoute`: Route assigned to a vehicle in a specific run.
- `RouteStop`: Ordered stop in an optimized route with arrival time, departure time, and delivery status.
