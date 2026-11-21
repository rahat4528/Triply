# Location-Based Service - API Specification

## Base URL: `/api/v1`

### 1. Location Ingestion & Telemetry
- `POST /locations/ping`
  - Ingests user coordinate update (`latitude`, `longitude`, `accuracy`, `source: DEVICE|MANUAL|SIMULATED`, `clientUpdateId`).
  - Evaluates active geofences and returns triggered proximity notifications.
- `GET /locations/session/status`
  - Returns current live session state, duration, and stop status.

### 2. Nearby Spatial Discovery
- `GET /places/nearby?lat={lat}&lon={lon}&radius={meters}&category={cat}&openNow={bool}&search={text}`
  - Executes PostGIS `ST_DWithin` spatial query sorted by geodesic distance.
- `GET /places/{id}`
  - Detailed metadata for place including operational hours and upcoming events.
- `POST /places`
  - Business account creates a verified place listing.

### 3. Geofences
- `GET /geofences`
  - Lists user's configured circular and polygon geofences.
- `POST /geofences`
  - Creates a geofence (`name`, `type: CIRCLE|POLYGON`, `latitude`, `longitude`, `radius`, `geometry: GeoJSON`, `dwellMinutes`).
- `DELETE /geofences/{id}`
  - Deletes a geofence and clears its transient state.
- `GET /geofences/{id}/events`
  - Retrieves enter/exit event history for a specific geofence.

### 4. Consented Location Sharing
- `POST /shares`
  - Creates a time-bounded location share (`recipientEmail`, `durationMinutes: 15-1440`). Returns share token.
- `GET /shares/active`
  - Lists sender's currently active sharing links.
- `DELETE /shares/{id}/revoke`
  - Immediately revokes sharing access with instantaneous effect.
- `GET /shares/view/{token}`
  - Recipient endpoint displaying sender's last known location and timestamp (strictly rejected if expired or revoked).

### 5. Privacy Center & Data Management
- `GET /privacy/consent`
  - Returns ledger of recorded consents and active permissions.
- `POST /privacy/consent/revoke`
  - Revokes consent for specific purposes (e.g., location history, proximity notifications).
- `GET /privacy/export`
  - Exports user's entire geospatial and geofence data in GeoJSON/JSON format.
- `DELETE /privacy/purge`
  - Permanently deletes all personal location records and logs.
