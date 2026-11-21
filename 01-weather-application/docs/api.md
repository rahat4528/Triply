# Weather Application - API Specification

## Base URL: `/api/v1`

### 1. Geocoding & Locations
- `GET /locations/search?q={query}`
  - Searches place names with administrative regions and coordinates.
- `GET /locations/reverse?lat={lat}&lon={lon}`
  - Reverse geocodes coordinates to nearest locality with validation.
- `GET /locations/favorites`
  - Retrieves saved favorite locations for authenticated user.
- `POST /locations/favorites`
  - Saves a new location (`name`, `latitude`, `longitude`, `country`, `timezone`).
- `DELETE /locations/favorites/{id}`
  - Removes a saved location.
- `GET /locations/recent`
  - Retrieves recent search history for current session or user.
- `DELETE /locations/recent`
  - Clears all search history.

### 2. Weather Telemetry & Forecasts
- `GET /weather/current?lat={lat}&lon={lon}&units={metric|imperial}`
  - Returns current atmospheric readings, timestamps, and provider attribution.
- `GET /weather/forecast?lat={lat}&lon={lon}&days={1-14}&hourly=true`
  - Returns hourly time-series array and daily summary array.
- `GET /weather/historical?lat={lat}&lon={lon}&start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}`
  - Returns historical reanalysis data clearly flagged as reanalysis archive.
- `GET /weather/compare?locations={lat1,lon1|lat2,lon2...}`
  - Side-by-side comparative forecast metrics for multiple locations.

### 3. Alert Rules & Notifications
- `GET /alerts/rules`
  - Lists configured user alert rules.
- `POST /alerts/rules`
  - Creates a new threshold rule (`metric`, `comparator`, `value`, `cooldownMinutes`).
- `DELETE /alerts/rules/{id}`
  - Deletes an alert rule.
- `GET /alerts/notifications`
  - Returns historical fired alerts and status.

### 4. Preferences & Widgets
- `GET /preferences` & `PUT /preferences`
  - Reads and updates unit preferences and quiet hours.
- `POST /widgets/generate-token`
  - Issues embed token for iframe integration.
- `GET /widgets/embed/{token}`
  - Public embeddable JSON or HTML snippet endpoint.
