# Location-Based Service - Architecture Document

## 1. System Architecture
The Location-Based Service is architected as an event-driven geospatial platform using Next.js, NestJS/Express, PostgreSQL with PostGIS extension, Redis, and MapLibre GL JS with Turf.js.

```
       +---------------------------------------------+
       |             Next.js 14 Client               |
       |  (MapLibre GL JS, Geofence Editor, Turf.js) |
       +----------------------+----------------------+
                              | HTTPS / WebSocket (Socket.IO)
                              v
       +---------------------------------------------+
       |             Backend API Service             |
       |  - Geolocation Ingestion Pipeline           |
       |  - PostGIS Spatial Search Service           |
       |  - Geofence Evaluation Engine (Hysteresis)  |
       |  - Consented Sharing Service                |
       |  - Privacy & Retention Purge Worker         |
       +-------+--------------------+----------------+
               |                    |
               v                    v
       +---------------+    +------------------------+
       | PostgreSQL 16 |    | Redis Cache / PubSub   |
       | + PostGIS 3.4 |    | - Geofence Live State  |
       | (triply_loc)  |    | - Real-time Share TTL  |
       +---------------+    +------------------------+
```

## 2. Domain Data Model
- **User**: System user account with role and authentication credentials.
- **UserLocationPreference**: Stored privacy configurations, default discovery radius, quiet hours, and data retention days.
- **SavedLocation**: Pinned personal places with encrypted coordinate fields.
- **PlaceCategory**: Taxonomy of venue categories (e.g., Hospital, Restaurant, EV Charging, Supermarket).
- **Place**: Seeded and user/business-registered points of interest with PostGIS `geography(Point, 4326)` geometry and GiST index.
- **PlaceEvent**: Upcoming scheduled events linked to places.
- **Geofence**: Defined circular or polygon boundaries owned by users or businesses with spatial geometry.
- **GeofenceState**: Per-user, per-geofence transient status (`INSIDE`, `OUTSIDE`, `ENTERED_AT`, `EXITED_AT`).
- **GeofenceEvent**: Audit log of enter/exit occurrences with timestamp, accuracy radius, and source (`DEVICE`, `MANUAL`, `SIMULATED`).
- **LocationPermissionRecord**: Immutable consent ledger tracking purpose, grant timestamp, and revocation timestamp.
- **LocationShare**: Opt-in, time-delimited sharing token between users with expiration and instant revocation flag.
- **LocationNotification**: Geographic alert notifications delivered via in-app feeds, web push, or email sink.

## 3. Geofence Evaluation State Machine
```
[Location Ping Arrives]
       |
       v
[Accuracy Check: Accuracy <= GeofenceRadius * 0.5?]
   |                    |
   | No                 | Yes
   v                    v
[Drop / Ignore]      [Spatial Test: ST_Contains / ST_DWithin]
                        |
                        +---> Inside boundary?
                        |        |
                        |        +--> Current state was OUTSIDE?
                        |        |       |
                        |        |       +--> Consecutive samples >= 2?
                        |        |               |
                        |        |               +--> Fire ENTER Event -> Set state INSIDE
                        |        |
                        |        +--> Current state was INSIDE?
                        |                |
                        |                +--> No change (Dwell)
                        |
                        +---> Outside boundary?
                                 |
                                 +--> Current state was INSIDE?
                                 |       |
                                 |       +--> Distance to boundary > HysteresisBuffer?
                                 |               |
                                 |               +--> Fire EXIT Event -> Set state OUTSIDE
                                 |
                                 +--> Current state was OUTSIDE?
                                         |
                                         +--> No change
```
