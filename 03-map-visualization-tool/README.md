# 03 - Map Visualization Tool

An analytical geospatial workspace designed for uploading spatial datasets, styling interactive layers, running geographic filters, conducting statistical spatial analysis, and exploring temporal patterns. It is centered around dataset exploration and visual intelligence rather than live user tracking.

---

## 1. Feature Overview

- **Spatial Ingestion Pipeline**:
  - Delimiter auto-detection (comma, tab, semicolon, pipe) and UTF-8 Byte Order Mark (BOM) stripping.
  - Coordinate header recognition (`lat`, `latitude`, `lon`, `longitude`, `x`, `y`).
  - Strict WGS84 range validation [-90, 90] & [-180, 180] with coordinate swap warnings.
  - GeoJSON FeatureCollection normalizer with automatic bounding box computation.
- **Layer Stacks & Visual Styling**:
  - Point layers with metric-driven radius and fill color.
  - Heatmap layers with weighted kernel density.
  - 3D extruded polygon layers with altitude scaling.
  - Statistical choropleths with Quantile, Equal Interval, and Natural Breaks (Jenks) classification.
  - Colorblind-safe palettes (Viridis, Magma, Plasma, Blues, Sunset).
- **Cross-Filtering & Analytics**:
  - Dynamic metric range sliders linked to responsive Recharts histograms.
  - Categorical attribute filters and spatial bounding box queries.
  - Geodesic measurement tools for path lengths (meters/km/miles) and polygon surface area ($m^2$, $km^2$, hectares, acres).
  - Spatial grid aggregation binning.
- **Time Slider & Animation**:
  - Temporal scrub slider with play, pause, and speed multipliers (1x, 2x, 5x).
- **Workspaces, Export & Sharing**:
  - Reopenable map projects with layer configurations and camera view state.
  - Asynchronous streaming export to GeoJSON and CSV.
  - Expirable, revocable public access links.

---

## 2. Architecture & Tech Stack

```
03-map-visualization-tool/
├── backend/          # Express/Node.js REST API service with TypeScript
├── frontend/         # Next.js 14 React client with Tailwind CSS and Recharts
├── database/         # Prisma schema, PostGIS SQL migrations, synthetic seed scripts
├── data-processing/  # CSV parser, GeoJSON parser, classification, geodesic measurements
├── visualization/    # Layer builder, deck.gl layer specs, spatial aggregator, color scales
├── tests/            # Test suite (CSV, GeoJSON, classification, measurements, aggregation, API)
├── docs/             # Requirements, API specs, architecture, completion report
└── docker-compose.yml
```

### Technology Choices & Rationale
- **Next.js 14 & React**: Multi-panel analytical layout, non-blocking UI during dataset processing.
- **PostgreSQL 16 & PostGIS 3.4**: Native spatial indexing, vector tile (`ST_AsMVT`) extraction, and spatial binning.
- **Custom Parsing Engine**: Ingestion with per-row issue logging and memory-safe processing.
- **Recharts**: Responsive SVG statistical charts cross-filtered with geospatial layers.

---

## 3. Provider Terms, Attribution & Privacy

- **Basemap Attribution**: Map rendering includes OpenStreetMap contributors attribution.
- **Configurable Basemap Fallback**: Includes blank-canvas fallback mode so the tool operates offline or without tile server connectivity.
- **Dataset Privacy**: Uploaded datasets are private to the owning user account unless shared via an explicit, revocable token.

---

## 4. Setup and Installation

### Prerequisites
- Node.js >= 18.x (Node 20+ recommended)
- npm or pnpm
- Docker & Docker Compose (optional for PostGIS and MinIO containers)

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
The backend API starts on `http://localhost:4003`. Healthcheck is available at `/health`.

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend application is accessible at `http://localhost:3003`.

---

## 5. Running Tests

Execute the comprehensive test suite:
```bash
cd backend
npm test
```
Test suite covers:
- CSV parser (delimiter detection, BOM stripping, coordinate swap detection) (`csv-parser.spec.ts`)
- GeoJSON parser and bounding box calculator (`geojson-parser.spec.ts`)
- Statistical classification: Quantile, Equal Interval, Natural Breaks (`classification.spec.ts`)
- Geodesic distance and surface area measurements (`geodesic-measurement.spec.ts`)
- Spatial grid binning and aggregation (`spatial-aggregator.spec.ts`)
- REST API integration tests (`api.spec.ts`)
