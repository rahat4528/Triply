# Triply Repository Overview

Triply is a comprehensive monorepo delivering five independent, production-grade applications across travel, geospatial analysis, and logistics domains.

## Architecture Highlights
- **Strict Isolation**: Each application maintains an independent frontend, backend, database schema, migration pipeline, docker compose stack, and dependency tree.
- **No Shared Runtime Databases**: Applications never share database tables or foreign keys. Each domain remains self-contained.
- **Domain Focus**:
  1. `01-weather-application`: Real-time meteorological telemetry, multi-day forecasting, threshold alerts, and WMO code analysis.
  2. `02-location-based-service`: User-consented spatial tracking, proximity search with PostGIS, circular and polygon geofences, and privacy controls.
  3. `03-map-visualization-tool`: Geospatial data ingestion (GeoJSON/CSV), deck.gl and MapLibre analytical rendering, layer styling, choropleths, and temporal playback.
  4. `04-travel-planner-app`: Multi-day itinerary composition, collaborative trip management, cross-timezone tracking, and multi-currency budgeting.
  5. `05-delivery-route-optimizer`: Constrained multi-vehicle routing, pickup-and-delivery pairs, time-window satisfaction, dispatching, and driver route execution.
