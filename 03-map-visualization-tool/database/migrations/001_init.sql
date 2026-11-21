-- PostGIS Schema Migration for Map Visualization Tool (triply_map_viz_db)

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Dataset" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sourceFormat" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "bounds" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "isSampleData" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_dataset_user" ON "Dataset"("userId");

CREATE TABLE IF NOT EXISTS "DatasetColumn" (
    "id" TEXT PRIMARY KEY,
    "datasetId" TEXT NOT NULL REFERENCES "Dataset"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "inferredType" TEXT NOT NULL,
    "isGeometry" BOOLEAN NOT NULL DEFAULT false,
    "nullCount" INTEGER NOT NULL DEFAULT 0,
    "distinctCount" INTEGER NOT NULL DEFAULT 0,
    "sampleValues" TEXT[] DEFAULT ARRAY[]::TEXT[]
);

CREATE INDEX IF NOT EXISTS "idx_dataset_column" ON "DatasetColumn"("datasetId");

CREATE TABLE IF NOT EXISTS "GeographicFeature" (
    "id" TEXT PRIMARY KEY,
    "datasetId" TEXT NOT NULL REFERENCES "Dataset"("id") ON DELETE CASCADE,
    "properties" JSONB NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "geometryType" TEXT NOT NULL,
    "geom" geography(Geometry, 4326),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_geo_feature_dataset" ON "GeographicFeature"("datasetId");
CREATE INDEX IF NOT EXISTS "idx_geo_feature_coords" ON "GeographicFeature"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "idx_geo_feature_geom" ON "GeographicFeature" USING GIST ("geom");

CREATE TABLE IF NOT EXISTS "MapProject" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "centerLat" DOUBLE PRECISION NOT NULL DEFAULT 51.5074,
    "centerLon" DOUBLE PRECISION NOT NULL DEFAULT -0.1278,
    "zoom" DOUBLE PRECISION NOT NULL DEFAULT 11.0,
    "pitch" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "bearing" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "basemapStyle" TEXT NOT NULL DEFAULT 'standard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_map_project_user" ON "MapProject"("userId");

CREATE TABLE IF NOT EXISTS "MapLayer" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "MapProject"("id") ON DELETE CASCADE,
    "datasetId" TEXT NOT NULL REFERENCES "Dataset"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_map_layer_project" ON "MapLayer"("projectId");
CREATE INDEX IF NOT EXISTS "idx_map_layer_dataset" ON "MapLayer"("datasetId");

CREATE TABLE IF NOT EXISTS "FilterConfiguration" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "MapProject"("id") ON DELETE CASCADE,
    "columnName" TEXT NOT NULL,
    "filterType" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS "idx_filter_config_project" ON "FilterConfiguration"("projectId");

CREATE TABLE IF NOT EXISTS "ExportJob" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "datasetId" TEXT NOT NULL REFERENCES "Dataset"("id") ON DELETE CASCADE,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "downloadUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_export_job_user" ON "ExportJob"("userId");
CREATE INDEX IF NOT EXISTS "idx_export_job_status" ON "ExportJob"("status");

CREATE TABLE IF NOT EXISTS "SharedMapPermission" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "MapProject"("id") ON DELETE CASCADE,
    "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "shareToken" TEXT UNIQUE NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "expiresAt" TIMESTAMP(3),
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_shared_map_token" ON "SharedMapPermission"("shareToken");
CREATE INDEX IF NOT EXISTS "idx_shared_map_project" ON "SharedMapPermission"("projectId");
