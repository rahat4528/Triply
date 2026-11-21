# Geographic and Privacy Standards

This document establishes standards across all applications in Triply for geospatial computation, unit representations, provider interactions, and location privacy.

## 1. Geographic Coordinate Standards
- **Coordinate System**: WGS84 (EPSG:4326) canonical representation.
- **Order of Coordinates**: In GeoJSON, coordinate arrays are strictly formatted as `[longitude, latitude]`. When passing latitude and longitude to backend services or APIs, parameters must be explicitly labeled.
- **Validation**:
  - Latitude: $[-90.0, 90.0]$
  - Longitude: $[-180.0, 180.0]$
  - Any NaN, null, undefined, or out-of-range values are rejected before storage or provider invocation.
  - Coordinate swap detection heuristic: warns users if latitude exceeds 90 or matches known coastal/inland inverted patterns.
- **Geodesic Distance**: Use Haversine or Vincenty geodesic formulas on PostGIS `geography` types. Euclidean degree calculations are prohibited for distance measurements.

## 2. Unit Conversions and SI Storage
All calculations, internal representations, and persistent storage must use International System of Units (SI) canonical standards:
- **Temperature**: Degrees Celsius (°C)
- **Speed**: Meters per second (m/s) or Kilometers per hour (km/h) canonical, converted to mph or knots on client display.
- **Pressure**: Hectopascals (hPa)
- **Precipitation**: Millimeters (mm)
- **Distance**: Meters (m)
- **Time**: Stored as UTC ISO 8601 strings or Unix epoch milliseconds with corresponding IANA time zone identifiers (e.g., `Europe/London`, `America/New_York`).
- **Money**: Handled in integer minor currency units (cents/pence) or arbitrary-precision decimal representations.

## 3. Location Privacy Principles
- **Explicit Consent**: Geolocation must never be requested automatically on initial page load. Geolocation prompts require direct user action (e.g., clicking "Locate Me").
- **Permission States**: All permission states (`granted`, `denied`, `prompt`, `unavailable`, `timeout`) must have distinct UI treatment.
- **Data Minimization**: High-precision latitude and longitude are not persisted in server access logs or error reporting.
- **Revocability and Retention**: Location sharing links must be time-delimited and revocable immediately. Users can purge their historical location points and search history at any time.
- **Source Labeling**: Data origins must be tagged explicitly as `DEVICE`, `MANUAL`, or `SIMULATED`.

## 4. Provider Compliance & Attribution
- Attribution notices for OpenStreetMap contributors and data sources (such as Open-Meteo) must remain visible in views utilizing their services.
- Rate limiting, backoff, and caching must align with provider usage policies.
