-- Initial migration for triply_travel_planner_db

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Trip" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "baseCurrency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "budgetLimitMinor" BIGINT NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE "Role" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');
CREATE TYPE "ItemType" AS ENUM ('ACTIVITY', 'LODGING', 'TRANSPORT', 'DINING', 'CUSTOM');
CREATE TYPE "ExpenseCategory" AS ENUM ('ACCOMMODATION', 'TRANSPORT', 'MEALS', 'ACTIVITIES', 'SHOPPING', 'FEES', 'OTHER');
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

CREATE TABLE IF NOT EXISTS "TripMember" (
    "id" TEXT PRIMARY KEY,
    "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TripMember_tripId_userId_unique" UNIQUE ("tripId", "userId")
);

CREATE TABLE IF NOT EXISTS "Destination" (
    "id" TEXT PRIMARY KEY,
    "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timezone" TEXT NOT NULL,
    "arrivalDate" TIMESTAMP(3),
    "departureDate" TIMESTAMP(3),
    "sequence" INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "ItineraryDay" (
    "id" TEXT PRIMARY KEY,
    "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "dayNumber" INT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    CONSTRAINT "ItineraryDay_tripId_dayNumber_unique" UNIQUE ("tripId", "dayNumber")
);

CREATE TABLE IF NOT EXISTS "ItineraryItem" (
    "id" TEXT PRIMARY KEY,
    "dayId" TEXT NOT NULL REFERENCES "ItineraryDay"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL DEFAULT 'ACTIVITY',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "timezone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationName" TEXT,
    "costMinor" BIGINT DEFAULT 0,
    "currency" VARCHAR(3),
    "bookingReference" TEXT,
    "notes" TEXT,
    "sequence" INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "TripExpense" (
    "id" TEXT PRIMARY KEY,
    "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "description" TEXT NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'OTHER',
    "date" TIMESTAMP(3) NOT NULL,
    "paidByUserId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "exchangeRateToBase" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "amountInBaseCurrencyMinor" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "TripInvitation" (
    "id" TEXT PRIMARY KEY,
    "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "email" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ChecklistItem" (
    "id" TEXT PRIMARY KEY,
    "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "assignedToUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT PRIMARY KEY,
    "tripId" TEXT NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "action" TEXT NOT NULL,
    "detailsJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_trip_dates" ON "Trip"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS "idx_trip_member" ON "TripMember"("tripId", "userId");
CREATE INDEX IF NOT EXISTS "idx_destination_trip_seq" ON "Destination"("tripId", "sequence");
CREATE INDEX IF NOT EXISTS "idx_itinerary_day_trip" ON "ItineraryDay"("tripId", "date");
CREATE INDEX IF NOT EXISTS "idx_itinerary_item_day" ON "ItineraryItem"("dayId", "sequence");
CREATE INDEX IF NOT EXISTS "idx_expense_trip_category" ON "TripExpense"("tripId", "category");
