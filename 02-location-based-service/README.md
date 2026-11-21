# 02 - Location-Based Service

A privacy-first, user-consented geospatial proximity and geofencing platform. It enables live location detection, spatial radius queries, circular and polygon geofence management, real-time entry/exit event triggering, nearby service discovery, and time-delimited, revocable location sharing.

---

## 1. Feature Overview

- **User Location & Consent Model**:
  - Zero auto-prompting on initial page load. Geolocation is requested strictly on user-initiated action ("Use My Location").
  - Full support for all browser permission states (`prompt`, `granted`, `denied`, `unavailable`, `timeout`).
  - Source transparency: All pings strictly labeled as `DEVICE`, `MANUAL`, or `SIMULATED`.
  - User-controlled live tracking sessions with explicit start/stop and auto-termination.
- **Nearby Spatial Discovery**:
  - Geodesic spatial radius search (`ST_DWithin` on PostGIS geography) ordered by distance in canonical meters.
  - Category filtering: Healthcare, Dining & Cafes, Public Transit, Fuel & EV Charging, Parks & Recreation.
  - Multi-attribute filtering with dynamic radius sliders and "open now" status.
- **Geofencing Engine**:
  - Circular boundaries with radius verification $[50\text{ m}, 50,000\text{ m}]$ and GeoJSON polygon boundaries.
  - Accuracy-aware filtering: drops pings whose accuracy circle exceeds 50% of the geofence radius to eliminate false triggers.
  - Hysteresis and minimum dwell confirmation: requires consecutive verified hits before firing `ENTER`.
  - Idempotent update tracking and timestamp ordering to handle delayed or out-of-order pings.
- **Consented Location Sharing**:
  - Time-delimited sharing tokens (15m, 1h, 4h, 24h).
  - Instant revocation: sender can invalidate links at any moment with immediate effect.
  - Recipient view displaying last-known location and timestamp strictly during active window.
- **Privacy Center & Data Sovereignty**:
  - Immutable consent ledger tracking purpose and lifecycle.
  - Field-level encryption for saved coordinates.
  - Export all personal location data in GeoJSON/JSON format.
  - Permanent purge with cascade deletion across all logs and states.

---

## 2. Architecture & Tech Stack

```
02-location-based-service/
├── backend/          # Express/Node.js REST API service with TypeScript
├── frontend/         # Next.js 14 React client with Tailwind CSS
├── database/         # Prisma schema, PostGIS SQL migrations, synthetic seed scripts
├── geolocation/      # Geodesic math, Geofence evaluation engine, Privacy guard
├── tests/            # Test suite (geodesic, geofence, polygon, privacy, sharing, API)
├── docs/             # Requirements, API specs, architecture, completion report
└── docker-compose.yml
```

### Technology Choices & Rationale
- **Next.js 14 & React**: Interactive map-first dashboard, responsive mobile controls, and real-time state management.
- **PostgreSQL 16 with PostGIS 3.4**: Native spatial types (`geography(Point, 4326)`), GiST spatial indexing, and `ST_DWithin` geodesic distance queries.
- **Custom Geofence Engine**: Precision state machine enforcing accuracy thresholds, hysteresis buffers, and dwell confirmation without proprietary dependencies.
- **Tailwind CSS & Lucide Icons**: Accessible, high-contrast UI with clear visual indicators for device vs. simulated locations.

---

## 3. Provider Terms, Attribution & Privacy

- **Attribution**: Map visualization integrates configurable tile endpoints with OpenStreetMap contributors attribution.
- **Location Privacy Standard**: Coordinates are never persisted in plaintext server access logs. Historical tracking is disabled by default.

---

## 4. Setup and Installation

### Prerequisites
- Node.js >= 18.x (Node 20+ recommended)
- npm or pnpm
- Docker & Docker Compose (for PostGIS and Redis containers)

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Running Backend
```bash
cd backend
npm install
npm run build
npm start
```
The backend API starts on `http://localhost:4002`. Healthcheck is available at `/health`.

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend application is accessible at `http://localhost:3002`.

---

## 5. Running Tests

Execute the comprehensive test suite:
```bash
cd backend
npm test
```
Test suite covers:
- Geodesic distance & bearing calculations (`geodesic.spec.ts`)
- Geofence accuracy filtering, hysteresis, and enter/exit transitions (`geofence-engine.spec.ts`)
- Polygon boundary containment via ray-casting (`polygon-containment.spec.ts`)
- Privacy guard, field-level encryption, log redaction, retention expiration (`privacy-guard.spec.ts`)
- Consented location sharing and instant revocation (`sharing.spec.ts`)
- REST API integration tests (`api.spec.ts`)
