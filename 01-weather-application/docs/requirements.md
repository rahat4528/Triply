# Weather Application - Requirements Specification

## 1. System Objective
The Weather Application delivers a high-accuracy, privacy-conscious meteorological dashboard providing real-time observations, hourly time-series forecasting, multi-day daily projections, user-defined threshold alerting, historical reanalysis, and embeddable widgets.

## 2. Core Functional Requirements

### 2.1 Location Management & Geocoding
- **Location Search**: Search by city, municipality, postal code, or geographic coordinates. Returns list with name, administrative area, country code, latitude, longitude, elevation, and IANA time zone.
- **Ambiguity Resolution**: Disambiguation displays administrative area and country to prevent location confusion.
- **Coordinate Validation**: Latitude must be between -90 and +90; Longitude between -180 and +180. Swapped coordinates are rejected or flagged.
- **Client Geolocation**: Invoked only upon explicit user interaction (e.g., clicking "Current Location"). No automatic geolocation on page load.
- **Favorites & Recent Searches**:
  - Authenticated users: favorites synchronized to PostgreSQL database.
  - Anonymous users: favorites stored strictly in local client storage.
  - Search history can be cleared on demand; anonymous search queries are never logged server-side.

### 2.2 Current Weather & Atmospheric Metrics
- Real-time observation data:
  - Ambient temperature (°C canonical, selectable °F)
  - Apparent ("Feels like") temperature
  - Weather condition and corresponding WMO icon/description
  - Relative humidity (%)
  - Wind speed (km/h, m/s, mph, knots) and cardinal/degree direction
  - Atmospheric surface pressure (hPa, inHg, mmHg)
  - Cloud cover percentage (%)
  - Visibility (km/miles) where available, otherwise displayed as "unavailable"
  - Solar cycle: Sunrise and sunset computed with local IANA time zone handling.
- Timestamp Disclosure: Every view prominently indicates observation time, data fetch time, and viewer local time.

### 2.3 Hourly & Multi-Day Forecasting
- **Hourly Forecast**: 24- to 168-hour forecast with temperature trend curves, precipitation probability (%), precipitation amount (mm/in), and wind gusts.
- **Daily Forecast**: 7- to 14-day overview with minimum/maximum temperatures, dominant condition, UV index, and rain likelihood.
- **Missing Data Handling**: Null or missing values display "unavailable" rather than zero.

### 2.4 Alerting & Threshold Monitoring
- **Threshold Rule Engine**: User-configured metrics (e.g., Temperature > 35°C, Wind > 60 km/h, Rain Probability > 80%).
- **Evaluation Cycle**: Evaluated against latest forecast ingestion with cooldown periods and deduplication logic.
- **Official Warnings**: Displayed only when an official meteorological agency adapter is active; otherwise explicitly labeled as "Official alerts not configured for this region."
- **Notification Channels**: In-app notifications, mock email dispatch sink (for development), and web push hooks with configurable quiet hours.

### 2.5 Advanced Capabilities
- **Historical Analysis**: Historical reanalysis queries (e.g., ERA5 reanalysis via Open-Meteo Historical API), strictly segregated and labeled as reanalysis archive data, never mixed into forecast lines without demarcation.
- **Multi-Location Comparison**: Side-by-side comparison tables and normalized chart traces for up to 4 locations.
- **Weather Map Layers**: Configurable precipitation/radar tile overlay with attribution and timestamp badges.
- **Embeddable Widgets**: Standalone iframe-ready views with API token scoping and rate limits.
- **Progressive Web App (PWA)**: Service worker caching of application shell and latest forecast with "Offline - Data from [timestamp]" indicator.

## 3. Privacy, Data Retention, and Provider Terms
- Respects Open-Meteo non-commercial and commercial terms, displaying required attribution.
- API requests are rate-limited and cached in Redis with configurable TTL (e.g., 15-30 minutes for forecasts, 24 hours for geocoding).
- API usage recorded in `APIUsageRecord` for rate-limit budget tracking.
