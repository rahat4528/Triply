# Map Visualization Tool - Architecture Document

## 1. System Architecture
The tool is built with a Next.js workspace UI, deck.gl and MapLibre GL JS rendering, and an Express/Node.js backend with PostgreSQL/PostGIS and MinIO S3 object storage.

```
       +------------------------------------------------------+
       |               Next.js 14 Map Workspace               |
       |  - Layer Panel (Left)        - Filters/Charts (Right)|
       |  - MapLibre & deck.gl View   - Time Slider (Bottom)  |
       +--------------------------+---------------------------+
                                  | REST / Vector Tiles (MVT)
                                  v
       +------------------------------------------------------+
       |                 Backend API Gateway                  |
       |  - Dataset Ingestion Controller (Streaming Parser)   |
       |  - PostGIS Spatial Aggregator (ST_AsMVT, Bins)       |
       |  - Layer & Project Configuration Service             |
       |  - Export Worker & Signed URL Generator              |
       +-----------+--------------------+---------------------+
                   |                    |
                   v                    v
       +--------------------+   +-----------------------+
       |   PostgreSQL 16    |   | S3-Compatible Storage |
       |   + PostGIS 3.4    |   | (MinIO Object Store)  |
       | (triply_map_viz_db)|   +-----------------------+
       +--------------------+
```

## 2. Domain Data Model
- **User**: Workspace owner or collaborator.
- **Dataset**: Master metadata record (name, row count, bounds, CRS, source format).
- **DatasetFile**: Raw uploaded artifact stored in S3-compatible storage.
- **DatasetColumn**: Inferred column metadata (name, detected type, null count, distinct count, sample values).
- **GeographicFeature**: PostGIS row holding `geom geography(Geometry, 4326)` and `properties jsonb` with GiST and dataset indexes.
- **MapProject**: Saved workspace state containing title, description, camera viewport (`zoom`, `centerLat`, `centerLon`, `pitch`, `bearing`).
- **MapLayer**: Layer instance (type: `POINT`, `LINE`, `POLYGON`, `HEATMAP`, `CLUSTER`, `CHOROPLETH`).
- **LayerConfiguration**: JSON payload storing color scales, radii, height scales, classification method, and opacity.
- **FilterConfiguration**: Spatial bounding box, attribute range, or categorical filters.
- **ExportJob**: Asynchronous export job tracking progress, output file URL, and expiration.
- **SharedMapPermission**: Role-based access (`OWNER`, `EDITOR`, `VIEWER`) and public share tokens.
