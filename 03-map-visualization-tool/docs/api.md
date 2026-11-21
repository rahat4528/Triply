# Map Visualization Tool - API Specification

## Base URL: `/api/v1`

### 1. Dataset Ingestion & Management
- `POST /datasets/upload`
  - Multipart upload for CSV or GeoJSON files.
  - Runs delimiter detection, coordinate validation, column inference, and returns preview.
- `POST /datasets/confirm-ingest`
  - Confirms column mapping and streams features into PostGIS.
- `GET /datasets`
  - Lists uploaded datasets with row counts and summary bounds.
- `GET /datasets/{id}/features?page=1&limit=100&bbox=minLon,minLat,maxLon,maxLat`
  - Keyset-paginated feature query with bounding box filtering.
- `GET /datasets/{id}/summary`
  - Returns statistical summaries, column distributions, and bounding box metrics.

### 2. Analytical Vector Tiles & Aggregation
- `GET /tiles/{datasetId}/{z}/{x}/{y}.mvt`
  - Generates binary Mapbox Vector Tile (MVT) using PostGIS `ST_AsMVT`.
- `POST /analysis/aggregate`
  - Performs spatial binning (grid or hexagonal aggregation) and returns counts and metric averages.
- `POST /analysis/measure`
  - Calculates geodesic distance and area for user-drawn line strings or polygons.

### 3. Map Projects & Workspaces
- `GET /projects` & `POST /projects`
  - Lists and saves workspace projects with layer and viewport configurations.
- `GET /projects/{id}` & `PUT /projects/{id}`
  - Retrieves or updates project layer configurations, active filters, and camera position.
- `POST /projects/{id}/duplicate`
  - Duplicates project configuration for exploratory branching.

### 4. Exports & Sharing
- `POST /exports`
  - Initiates streaming export job (`datasetId`, `format: CSV|GEOJSON`, `filterConfig`).
- `GET /exports/{id}`
  - Checks export status and returns signed download link.
- `POST /shares`
  - Generates expirable, revocable public access link for a map project.
- `GET /shares/{token}`
  - Public view endpoint delivering read-only map layers and styling.
