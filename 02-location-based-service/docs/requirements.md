# Location-Based Service - Requirements Specification

## 1. System Objective
The Location-Based Service is a privacy-first, user-consented geospatial proximity and geofencing platform. It enables live location detection, spatial radius queries, circular and polygon geofence management, real-time entry/exit event triggering, nearby service discovery, and time-delimited, revocable location sharing.

## 2. Privacy & Permission Principles (Mandatory)
- **Zero Auto-Prompting**: The application never initiates geolocation prompts on page load. A clear privacy notice explains the purpose, and geolocation is requested strictly upon user-initiated action (e.g., clicking "Use My Location").
- **Permission State Support**: Full lifecycle support for all browser permission states: `prompt`, `granted`, `denied`, `unavailable`, `timeout`.
- **Honest Tracking Disclosures**:
  - The web application explicitly clarifies that geofences are evaluated only while the application is active in the foreground; background geofencing requires native OS capabilities not present in standard web browsers.
  - Manual and simulated locations are strictly tagged with source flags (`DEVICE`, `MANUAL`, `SIMULATED`) and never misrepresented as authentic live tracking.
- **Data Minimization & Ephemeral Coordinates**:
  - Precise latitude/longitude coordinates are not retained in plaintext server logs or telemetry.
  - Geofence evaluation maintains minimal state (`INSIDE`, `OUTSIDE`).
  - Historical location logging is disabled by default; when explicitly enabled by the user, retention is time-bounded with automated purging jobs.
- **Privacy Center**:
  - View all stored location points and active consent records (`LocationPermissionRecord`).
  - Export all personal location records in GeoJSON/JSON format.
  - One-click deletion of any or all location data with permanent cascade purging.

## 3. Core Functional Requirements

### 3.1 Geospatial Search & Discovery
- **PostGIS Geography Queries**: Spatial radius search using `ST_DWithin` on indexed WGS84 geography columns.
- **Category Filtering**: Discovery across defined categories (Healthcare, Dining, Fuel/EV Charging, Tourism, Transit, Lodging).
- **Spatial Ordering**: Distance-sorted results in canonical SI meters, converted to kilometers or miles on client display.
- **Open Now & Keyword Search**: Multi-attribute filtering with spatial bounding boxes.

### 3.2 Geofence Management & Evaluation Engine
- **Boundary Types**:
  - **Circular Geofences**: Center point `(lat, lon)` with radius bounds $[50\text{ m}, 50,000\text{ m}]$.
  - **Polygon Geofences**: Valid GeoJSON Polygon geometry verified for simplicity, absence of self-intersections, vertex count limits ($\le 100$), and antimeridian handling.
- **Accuracy-Aware Ingestion**: Samples with accuracy radius greater than 50% of the geofence radius are rejected as too coarse to prevent false triggers.
- **Hysteresis & Dwell Time**: Requires minimum dwell duration (e.g., 30 seconds) or consecutive confirmations to eliminate boundary jitter.
- **Idempotency & Timestamp Ordering**: Repeated update IDs are deduplicated; out-of-order client pings are sorted or ignored.

### 3.3 Consented Location Sharing
- **Time-Limited Links**: Share live coordinates with designated recipients for a fixed duration (15m, 1h, 4h, 24h).
- **Instant Revocation**: Senders can revoke access immediately with real-time websocket/SSE invalidation.
- **Recipient Transparency**: Shows last-known location and exact "last updated" timestamp only during the active share window.

### 3.4 Aggregated Proximity Analytics
- Privacy-preserving heatmaps and frequency counts aggregated by spatial grid cells or administrative boundary with minimum $k$-anonymity threshold ($k \ge 5$) to prevent re-identification.
