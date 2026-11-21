# Delivery Route Optimizer

Production-grade, multi-vehicle routing optimization (VRP) and logistics fleet dispatch platform built with Next.js 14, Express, PostgreSQL, Redis, VROOM optimization solver protocol, and OSRM distance matrix integration.

## Key Capabilities
- **Multi-Vehicle Routing Problem (VRP)**: Solves pickups and deliveries (VRPPD) with strict customer time windows, service dwell times, driver shift limits, and heterogeneous fleet capacities (weight in kg, volume in m³, package unit counts).
- **VROOM Solver Protocol**: Complete request builder and response parser translating business logistics entities into standard VROOM C++ solver schemas.
- **Distance & Duration Matrix Engine**: OSRM API integration with high-fidelity geodesic Haversine distance matrix fallback for deterministic testing and offline resilience.
- **Independent Solution Validator**: Rigorously verifies that candidate solutions never violate capacity thresholds at any stop along the tour, respect all customer time window bounds, and satisfy driver working hours.
- **Infeasibility Diagnostics**: Pre-solve and post-solve diagnostic engine reporting clear explanations when orders cannot be scheduled (excess weight/volume, missing driver certifications/skills, impossible time windows).
- **Dispatcher Control Tower UI**: Interactive visual map displaying vehicle tours color-coded by vehicle, sequence numbers, depot markers, order management, and optimization run history.
- **Driver Mobile View**: Manifest for field operators with stop status progression (`SCHEDULED` -> `EN_ROUTE` -> `ARRIVED` -> `DELIVERED` -> `FAILED`).
- **Optimistic Concurrency & Race-Condition Guard**: Version-checked dispatch API preventing simultaneous duplicate route publishing.

## Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React.
- **Backend**: Express, TypeScript, Node.js 20.
- **Optimization Engine**: VROOM solver JSON protocol, OSRM routing matrix, independent solution validator.
- **Database & Storage**: PostgreSQL (`triply_route_optimizer_db`), Prisma ORM, Redis.
- **Testing**: Jest, Supertest, ts-jest (100% pass rate across 6 suites).

## Getting Started

### 1. Start Infrastructure
```bash
docker compose up -d
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Backend Setup & Tests
```bash
cd backend
npm install
npm test
npm run build
npm start
```

### 4. Frontend Setup & Run
```bash
cd ../frontend
npm install
npm run build
npm start
```
Frontend runs at `http://localhost:3004`, Backend API at `http://localhost:4004`.

## Automated Test Coverage
- `vroom-builder.spec.ts`: Translates vehicles, multi-dimensional capacities, and jobs into VROOM JSON schema.
- `vroom-parser.spec.ts`: Parses solver output tours, steps, loads, and captures unassigned orders.
- `solution-validator.spec.ts`: Validates compliant tours and reliably detects capacity overflow, late arrivals, and shift limit overruns.
- `infeasibility-diagnostics.spec.ts`: Flags oversized demand, driver skill deficits, and impossible time windows.
- `distance-matrix.spec.ts`: Validates Haversine geodesic calculation and N x N distance matrix generation.
- `api.spec.ts`: REST API endpoints for vehicles, delivery jobs, optimization runs, optimistic locking dispatch, and driver manifests.
