# Monorepo Architecture

## Structural Principles
Each application in this repository follows the single-responsibility domain design:

```
Triply/
├── 01-weather-application/
│   ├── frontend/
│   ├── backend/
│   ├── database/
│   ├── tests/
│   ├── docs/
│   ├── docker-compose.yml
│   └── README.md
├── 02-location-based-service/
├── 03-map-visualization-tool/
├── 04-travel-planner-app/
├── 05-delivery-route-optimizer/
└── docs/
```

### Communication and State
- **Inter-service Decoupling**: No runtime service dependencies exist between the 5 projects.
- **Database Segregation**:
  - `triply_weather_db` (01)
  - `triply_location_db` (02)
  - `triply_map_viz_db` (03)
  - `triply_travel_planner_db` (04)
  - `triply_route_optimizer_db` (05)
- **Adapter Layer**: All third-party providers (weather forecasts, geocoders, routing engines, solvers) sit behind explicit adapter interfaces with mock/fixture fallback implementations.
