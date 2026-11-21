# 01 - Weather Application

A glanceable, high-precision meteorological dashboard and alerting platform providing real-time observations, hourly forecast strips, 7-day daily projections, user-defined threshold alerts, historical reanalysis queries, and embeddable iframe widgets.

---

## 1. Feature Overview

- **Location Management**:
  - Full-text geocoding search with administrative region and country disambiguation.
  - Coordinate validation on WGS84 bounds with coordinate-swap detection.
  - Consent-driven browser geolocation on explicit user action (no automatic tracking).
  - Saved favorite locations and recent search history with one-click purge.
- **Atmospheric Telemetry**:
  - Ambient temperature and apparent ("feels-like") temperature.
  - Complete WMO weather code mapping to day/night icons and condition text.
  - Comprehensive atmospheric readings: humidity, wind speed and direction, barometric pressure, cloud cover, visibility (explicitly rendered as "unavailable" when unmeasured), and sunrise/sunset.
  - Timestamp transparency: observed time, data fetch time, and local viewer time.
- **Forecasting & Projections**:
  - 18-hour hourly forecast strip with temperature trend and precipitation probability.
  - 7-day daily outlook with high/low temperatures, rain likelihood, and condition indicators.
- **Threshold Alerting Engine**:
  - User-configurable rules (metric, comparator, threshold, cooldown period).
  - Scheduled evaluation with deduplication and re-arming logic.
  - Disclosed as "threshold alert based on forecast data".
  - In-app notification feed and mock email dispatch sink.
- **Advanced Capabilities**:
  - Multi-location side-by-side comparison.
  - ERA5 reanalysis archive historical query (explicitly labeled as reanalysis data, not real-time station observations).
  - Embeddable widgets with token-scoped iframe snippets.
  - Progressive Web App (PWA) offline caching with "Offline - Data from [timestamp]" indicators.

---

## 2. Architecture & Tech Stack

```
01-weather-application/
├── backend/          # Express/Node.js REST API service with TypeScript
├── frontend/         # Next.js 14 React client with Tailwind CSS and PWA Service Worker
├── database/         # Prisma schema, SQL migrations, seed scripts
├── integrations/     # Provider adapters, WMO codes, coordinate validator, unit converters
├── tests/            # Test suite (units, codes, coordinates, alerts, API, cache)
├── docs/             # Requirements, API specs, architecture, completion report
└── docker-compose.yml
```

### Technology Choices & Rationale
- **Next.js 14 & React**: Server-side rendering, responsive component architecture, and offline PWA service worker caching.
- **Tailwind CSS & Lucide Icons**: High-contrast, colorblind-safe, glanceable dashboard design.
- **Express & TypeScript**: Fast, strictly typed API gateway handling rate limits, cache headers, and routing.
- **PostgreSQL 16 & Prisma**: Relational persistence for users, favorites, preferences, and alert rules.
- **Redis Cache**: In-memory caching layer with TTL to respect upstream API rate limits.
- **Open-Meteo Integration Adapter**: High-resolution meteorological and geocoding API with deterministic local fixture fallback.

---

## 3. Provider Terms, Attribution & Privacy

- **Data Attribution**: Weather data provided under Creative Commons Attribution 4.0 International (CC BY 4.0) by Open-Meteo.com.
- **Rate Limits & Caching**: Upstream forecast queries are cached for 15 minutes (900 seconds) and geocoding for 24 hours. Daily usage budgets are monitored.
- **Commercial Notice**: Commercial production deployments require an Open-Meteo commercial API key configured in `.env`.
- **Location Privacy**: Geolocation is accessed strictly after user consent. User coordinates are never written to unencrypted log traces.

---

## 4. Setup and Installation

### Prerequisites
- Node.js >= 18.x (Node 20+ recommended)
- npm or pnpm
- Docker & Docker Compose (optional for local database container)

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
The backend API starts on `http://localhost:4001`. Healthcheck is available at `/health`.

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend dashboard is accessible at `http://localhost:3001`.

---

## 5. Running Tests

Execute the comprehensive test suite:
```bash
cd backend
npm test
```
Test suite covers:
- Unit conversion round trips (`units.spec.ts`)
- WMO weather code completeness (`weather-codes.spec.ts`)
- Coordinate validation & swap detection (`coordinate-validator.spec.ts`)
- Alert evaluation, cooldown, and labeling (`alert-evaluator.spec.ts`)
- Cache TTL, stale labeling, and API budget throttling (`cache-and-budget.spec.ts`)
- API endpoints and error handling (`api.spec.ts`)
