# Triply

Triply is a production-grade software suite comprising five independent applications in travel, geospatial analytics, and logistics technology.

## Applications Directory

1. **Weather Application** (`01-weather-application`)
   - Comprehensive meteorological dashboard featuring real-time atmospheric telemetry, multi-day hourly forecasts, interactive weather charts, user-defined alert thresholds, and offline PWA capability.
2. **Location-Based Service** (`02-location-based-service`)
   - Privacy-first geolocation platform featuring user-consented location tracking, spatial radius discovery with PostGIS, circular and polygon geofences, and live proximity triggers.
3. **Map Visualization Tool** (`03-map-visualization-tool`)
   - Analytical geospatial studio for uploading and visualizing GeoJSON and CSV datasets using MapLibre GL JS and deck.gl, supporting choropleths, 3D extrusions, and temporal playback.
4. **Travel Planner App** (`04-travel-planner-app`)
   - Journey organizer with multi-destination itinerary timelines, travel budgeting across currencies, collaborative permissions, and calendar exports.
5. **Delivery Route Optimizer** (`05-delivery-route-optimizer`)
   - Constrained vehicle routing optimizer supporting capacity limits, delivery time windows, pickup-and-delivery pairs, interactive dispatch map, and driver route execution.

## Architectural Principles
- **Total Independence**: Each application contains its own frontend, backend, database schema, migrations, configuration, and documentation.
- **Geographic Precision**: Canonical WGS84 coordinates, geodesic distance metrics, and strict input validation.
- **Privacy by Design**: Explicit consent models, data retention limits, and zero coordinate logging in server traces.

## Application Status Summary

| Application | Directory | Purpose | Status | Documentation |
|---|---|---|---|---|
| **Weather Application** | [`01-weather-application`](./01-weather-application) | Meteorological dashboard, hourly forecasts, threshold alerts | Completed | [Completion Report](./01-weather-application/docs/completion-report.md) |
| **Location-Based Service** | [`02-location-based-service`](./02-location-based-service) | Spatial proximity search, geofencing, privacy center | Completed | [Completion Report](./02-location-based-service/docs/completion-report.md) |
| **Map Visualization Tool** | [`03-map-visualization-tool`](./03-map-visualization-tool) | Dataset ingestion, statistical classification, spatial layers | Completed | [Completion Report](./03-map-visualization-tool/docs/completion-report.md) |
| **Travel Planner App** | [`04-travel-planner-app`](./04-travel-planner-app) | Itinerary sequencing, minor-unit budgeting, iCalendar feed | Completed | [Completion Report](./04-travel-planner-app/docs/completion-report.md) |
| **Delivery Route Optimizer** | [`05-delivery-route-optimizer`](./05-delivery-route-optimizer) | Multi-vehicle VRP, time windows, control tower, validator | Completed | [Completion Report](./05-delivery-route-optimizer/docs/completion-report.md) |

## Documentation
- [Final Delivery Report](file:///docs/final-delivery-report.md)
- [Repository Overview](file:///docs/repository-overview.md)
- [Architecture](file:///docs/architecture.md)
- [Technology Stack](file:///docs/technology-stack.md)
- [Development Guide](file:///docs/development-guide.md)
- [Geographic and Privacy Standards](file:///docs/geo-and-privacy-standards.md)
- [Project Index](file:///docs/project-index.md)
- [Progress Tracker](file:///PROGRESS.md)
