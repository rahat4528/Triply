-- Initial migration for triply_route_optimizer_db

CREATE TYPE "VehicleType" AS ENUM ('VAN', 'TRUCK_REFRIGERATED', 'CARGO_BIKE', 'ELECTRIC_VAN');
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'DISPATCHED', 'MAINTENANCE');
CREATE TYPE "JobType" AS ENUM ('DELIVERY', 'PICKUP');
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'ASSIGNED', 'COMPLETED', 'FAILED');
CREATE TYPE "RunStatus" AS ENUM ('DRAFT', 'SOLVING', 'COMPLETED', 'DISPATCHED', 'FAILED');
CREATE TYPE "StopDeliveryStatus" AS ENUM ('SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'DELIVERED', 'FAILED');

CREATE TABLE IF NOT EXISTS "Depot" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "openSeconds" INT NOT NULL DEFAULT 21600,
    "closeSeconds" INT NOT NULL DEFAULT 72000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Driver" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maxShiftDurationSec" INT NOT NULL DEFAULT 32400,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Vehicle" (
    "id" TEXT PRIMARY KEY,
    "code" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL DEFAULT 'VAN',
    "capacityKg" INT NOT NULL DEFAULT 1000,
    "capacityM3" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "capacityPieces" INT NOT NULL DEFAULT 50,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "currentDepotId" TEXT NOT NULL REFERENCES "Depot"("id"),
    "assignedDriverId" TEXT UNIQUE REFERENCES "Driver"("id"),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "DeliveryJob" (
    "id" TEXT PRIMARY KEY,
    "trackingCode" TEXT UNIQUE NOT NULL,
    "customerName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "demandKg" INT NOT NULL DEFAULT 10,
    "demandM3" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "demandPieces" INT NOT NULL DEFAULT 1,
    "timeWindowStartSec" INT NOT NULL DEFAULT 28800,
    "timeWindowEndSec" INT NOT NULL DEFAULT 64800,
    "serviceDurationSec" INT NOT NULL DEFAULT 300,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jobType" "JobType" NOT NULL DEFAULT 'DELIVERY',
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OptimizationRun" (
    "id" TEXT PRIMARY KEY,
    "status" "RunStatus" NOT NULL DEFAULT 'DRAFT',
    "objectiveValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalDistanceMeters" INT NOT NULL DEFAULT 0,
    "totalDurationSeconds" INT NOT NULL DEFAULT 0,
    "totalJobsAssigned" INT NOT NULL DEFAULT 0,
    "totalJobsUnassigned" INT NOT NULL DEFAULT 0,
    "version" INT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "OptimizedRoute" (
    "id" TEXT PRIMARY KEY,
    "runId" TEXT NOT NULL REFERENCES "OptimizationRun"("id") ON DELETE CASCADE,
    "vehicleId" TEXT NOT NULL REFERENCES "Vehicle"("id"),
    "totalDistanceMeters" INT NOT NULL DEFAULT 0,
    "totalDurationSeconds" INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "RouteStop" (
    "id" TEXT PRIMARY KEY,
    "routeId" TEXT NOT NULL REFERENCES "OptimizedRoute"("id") ON DELETE CASCADE,
    "jobId" TEXT REFERENCES "DeliveryJob"("id") ON DELETE SET NULL,
    "sequence" INT NOT NULL,
    "stopType" TEXT NOT NULL DEFAULT 'JOB',
    "estimatedArrivalSec" INT NOT NULL,
    "estimatedDepartureSec" INT NOT NULL,
    "cumulativeLoadKg" INT NOT NULL DEFAULT 0,
    "cumulativeLoadM3" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cumulativeLoadPieces" INT NOT NULL DEFAULT 0,
    "deliveryStatus" "StopDeliveryStatus" NOT NULL DEFAULT 'SCHEDULED'
);

CREATE INDEX IF NOT EXISTS "idx_vehicle_status" ON "Vehicle"("status");
CREATE INDEX IF NOT EXISTS "idx_job_status" ON "DeliveryJob"("status");
CREATE INDEX IF NOT EXISTS "idx_route_run" ON "OptimizedRoute"("runId");
CREATE INDEX IF NOT EXISTS "idx_route_vehicle" ON "OptimizedRoute"("vehicleId");
CREATE INDEX IF NOT EXISTS "idx_stop_route_seq" ON "RouteStop"("routeId", "sequence");
