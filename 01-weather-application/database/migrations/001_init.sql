-- Initial Schema Migration for Weather Application (triply_weather_db)

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SavedLocation" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "administrative" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "elevation" DOUBLE PRECISION,
    "timezone" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_saved_loc_user" ON "SavedLocation"("userId");
CREATE INDEX IF NOT EXISTS "idx_saved_loc_coords" ON "SavedLocation"("latitude", "longitude");

CREATE TABLE IF NOT EXISTS "RecentSearch" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "query" TEXT NOT NULL,
    "resolvedName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_recent_search_user" ON "RecentSearch"("userId");
CREATE INDEX IF NOT EXISTS "idx_recent_search_created" ON "RecentSearch"("createdAt");

CREATE TABLE IF NOT EXISTS "WeatherPreference" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "temperatureUnit" TEXT NOT NULL DEFAULT 'CELSIUS',
    "speedUnit" TEXT NOT NULL DEFAULT 'KM_H',
    "pressureUnit" TEXT NOT NULL DEFAULT 'HPA',
    "precipitationUnit" TEXT NOT NULL DEFAULT 'MM',
    "quietHoursStart" INTEGER,
    "quietHoursEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "WeatherSnapshot" (
    "id" TEXT PRIMARY KEY,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "locationName" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "feelsLike" DOUBLE PRECISION NOT NULL,
    "weatherCode" INTEGER NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "windDirection" DOUBLE PRECISION NOT NULL,
    "pressure" DOUBLE PRECISION NOT NULL,
    "uvIndex" DOUBLE PRECISION,
    "cloudCover" DOUBLE PRECISION,
    "visibility" DOUBLE PRECISION,
    "isDay" BOOLEAN NOT NULL DEFAULT true,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerName" TEXT NOT NULL DEFAULT 'open-meteo'
);

CREATE INDEX IF NOT EXISTS "idx_snapshot_lookup" ON "WeatherSnapshot"("latitude", "longitude", "observedAt");

CREATE TABLE IF NOT EXISTS "ForecastCache" (
    "id" TEXT PRIMARY KEY,
    "cacheKey" TEXT UNIQUE NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "forecastType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "sourceTimestamp" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isStale" BOOLEAN NOT NULL DEFAULT false,
    "staleReason" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_forecast_cache_key" ON "ForecastCache"("cacheKey");
CREATE INDEX IF NOT EXISTS "idx_forecast_cache_expires" ON "ForecastCache"("expiresAt");

CREATE TABLE IF NOT EXISTS "WeatherAlertRule" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "locationName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "metric" TEXT NOT NULL,
    "comparator" TEXT NOT NULL,
    "thresholdValue" DOUBLE PRECISION NOT NULL,
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 180,
    "lastTriggeredAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_alert_rule_user" ON "WeatherAlertRule"("userId");
CREATE INDEX IF NOT EXISTS "idx_alert_rule_active" ON "WeatherAlertRule"("isActive");

CREATE TABLE IF NOT EXISTS "AlertNotification" (
    "id" TEXT PRIMARY KEY,
    "ruleId" TEXT NOT NULL REFERENCES "WeatherAlertRule"("id") ON DELETE CASCADE,
    "metric" TEXT NOT NULL,
    "triggerValue" DOUBLE PRECISION NOT NULL,
    "thresholdValue" DOUBLE PRECISION NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_alert_notif_rule" ON "AlertNotification"("ruleId");
CREATE INDEX IF NOT EXISTS "idx_alert_notif_created" ON "AlertNotification"("createdAt");

CREATE TABLE IF NOT EXISTS "DataProvider" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "attribution" TEXT NOT NULL,
    "requiresApiKey" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dailyLimit" INTEGER NOT NULL DEFAULT 10000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "APIUsageRecord" (
    "id" TEXT PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "recordedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_api_usage_prov_date" ON "APIUsageRecord"("providerName", "recordedDate");

CREATE TABLE IF NOT EXISTS "WidgetConfig" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "token" TEXT UNIQUE NOT NULL,
    "locationName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'auto',
    "allowedMetrics" TEXT[] DEFAULT ARRAY['temperature', 'condition', 'wind', 'humidity'],
    "rateLimitPerHour" INTEGER NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_widget_token" ON "WidgetConfig"("token");
