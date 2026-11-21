-- PostGIS Schema Migration for Location-Based Service (triply_location_db)

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "UserLocationPreference" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "defaultRadiusMeters" INTEGER NOT NULL DEFAULT 5000,
    "distanceUnit" TEXT NOT NULL DEFAULT 'METERS',
    "historyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "quietHoursStart" INTEGER,
    "quietHoursEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SavedLocation" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "encryptedLat" TEXT NOT NULL,
    "encryptedLon" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_saved_loc_user" ON "SavedLocation"("userId");

CREATE TABLE IF NOT EXISTS "PlaceCategory" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT
);

CREATE TABLE IF NOT EXISTS "Place" (
    "id" TEXT PRIMARY KEY,
    "categoryId" TEXT NOT NULL REFERENCES "PlaceCategory"("id"),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geom" geography(Point, 4326),
    "isOpenNow" BOOLEAN NOT NULL DEFAULT true,
    "openingHours" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isSampleData" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_place_category" ON "Place"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_place_geom" ON "Place" USING GIST ("geom");

CREATE TABLE IF NOT EXISTS "PlaceEvent" (
    "id" TEXT PRIMARY KEY,
    "placeId" TEXT NOT NULL REFERENCES "Place"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_place_event_place" ON "PlaceEvent"("placeId");
CREATE INDEX IF NOT EXISTS "idx_place_event_time" ON "PlaceEvent"("startTime");

CREATE TABLE IF NOT EXISTS "Geofence" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CIRCLE',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "polygonGeoJson" TEXT,
    "geom" geography(Polygon, 4326),
    "dwellMinutes" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_geofence_user" ON "Geofence"("userId");
CREATE INDEX IF NOT EXISTS "idx_geofence_coords" ON "Geofence"("latitude", "longitude");

CREATE TABLE IF NOT EXISTS "GeofenceState" (
    "id" TEXT PRIMARY KEY,
    "geofenceId" TEXT NOT NULL REFERENCES "Geofence"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OUTSIDE',
    "consecutiveHits" INTEGER NOT NULL DEFAULT 0,
    "lastTransition" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPingTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("geofenceId", "userId")
);

CREATE TABLE IF NOT EXISTS "GeofenceEvent" (
    "id" TEXT PRIMARY KEY,
    "geofenceId" TEXT NOT NULL REFERENCES "Geofence"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'DEVICE',
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_geofence_event_geofence" ON "GeofenceEvent"("geofenceId");
CREATE INDEX IF NOT EXISTS "idx_geofence_event_user" ON "GeofenceEvent"("userId");
CREATE INDEX IF NOT EXISTS "idx_geofence_event_time" ON "GeofenceEvent"("triggeredAt");

CREATE TABLE IF NOT EXISTS "LocationPermissionRecord" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "purpose" TEXT NOT NULL,
    "permissionState" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "idx_permission_user" ON "LocationPermissionRecord"("userId");

CREATE TABLE IF NOT EXISTS "LocationShare" (
    "id" TEXT PRIMARY KEY,
    "token" TEXT UNIQUE NOT NULL,
    "senderId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "recipientEmail" TEXT NOT NULL,
    "lastLatitude" DOUBLE PRECISION NOT NULL,
    "lastLongitude" DOUBLE PRECISION NOT NULL,
    "lastAccuracy" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_location_share_token" ON "LocationShare"("token");
CREATE INDEX IF NOT EXISTS "idx_location_share_expires" ON "LocationShare"("expiresAt");

CREATE TABLE IF NOT EXISTS "LocationNotification" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_location_notif_user" ON "LocationNotification"("userId");
