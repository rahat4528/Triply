# Travel Planner Application

Production-grade, collaborative multi-destination travel planning and itinerary management application built with Next.js 14, Express, PostgreSQL, Redis, and MinIO S3 storage.

## Key Capabilities
- **Day-by-Day Itinerary Sequencing**: Visual calendar timeline grouping flights, bullet trains, hotels, cultural sightseeing, and dining events.
- **Time Zone & Date Line Precision**: True elapsed transit duration calculation and antimeridian cross-date line compensation.
- **Exact Minor-Unit Budget Math**: Integer-based arithmetic preventing IEEE 754 float inaccuracies, supporting multi-currency conversion (USD, EUR, GBP, JPY, CAD, AUD, CHF, BHD) and fair equal splits with remainder distribution.
- **Collaborative RBAC Matrix**: Multi-user permissions (`OWNER`, `EDITOR`, `VIEWER`), cryptographic invitation token generation (48-char hex) with TTL expiry and instant revocation.
- **RFC 5545 iCalendar Exporter**: Dynamic generation of `.ics` calendar feeds with stable UIDs, geographic coordinates (`GEO`), and event summaries.
- **Waypoint & Route Map**: Geocoded destination pins with verified WGS84 coordinates.
- **Packing & Pre-Trip Checklist**: Categorized task list with real-time completion tracking.

## Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React.
- **Backend**: Express, TypeScript, Node.js 20.
- **Data & Storage**: PostgreSQL (`triply_travel_planner_db`), Prisma ORM, Redis (invitation tokens & session cache), MinIO (S3-compatible document storage).
- **Standards & Feeds**: RFC 5545 iCalendar, ISO 4217 Currency Standards, WGS84 (SRID 4326).
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
Frontend runs at `http://localhost:3003`, Backend API at `http://localhost:4003`.

## Automated Test Coverage
- `timezone-calculator.spec.ts`: Inclusive day counts, antimeridian crossing, elapsed transit duration, activity overlap detection.
- `budget-arithmetic.spec.ts`: Minor unit conversions, currency formatting, multi-currency conversion, fair remainder split distribution.
- `ical-generator.spec.ts`: RFC 5545 VCALENDAR and VEVENT compliance, line folding at 75 octets, character escaping, geographic tags.
- `permission-matrix.spec.ts`: OWNER, EDITOR, VIEWER role privilege validation.
- `invitation-token.spec.ts`: Cryptographic token creation, TTL expiry, single-use validation, revocation.
- `api.spec.ts`: REST API endpoints for trips, itineraries, expenses, collaborators, checklists, and calendar feeds.
