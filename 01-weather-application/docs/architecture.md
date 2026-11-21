# Weather Application - Architecture Document

## 1. System Architecture
The Weather Application is built as a modular system with a Next.js frontend and a NestJS/Express-compatible TypeScript backend, supported by PostgreSQL and Redis.

```
       +---------------------------------------------+
       |           Next.js 14 Frontend               |
       | (PWA Service Worker, Recharts, Tailwind CSS)|
       +----------------------+----------------------+
                              | REST / JSON
                              v
       +---------------------------------------------+
       |             Backend API Service             |
       |  - Location Module                          |
       |  - Weather Aggregation Module               |
       |  - Cache & Rate Limiting Module (Redis)     |
       |  - Alert Evaluation Engine (BullMQ)         |
       |  - Widget Security & Token Validator        |
       +-------+--------------------+----------------+
               |                    |
               v                    v
       +---------------+    +------------------------+
       | PostgreSQL 16 |    | Weather Adapter        |
       | (Prisma ORM)  |    | - Open-Meteo Client    |
       +---------------+    | - Mock Fixture Sink    |
                            +------------------------+
```

## 2. Domain Data Model
- **User**: User credentials, role, email.
- **SavedLocation**: User's pinned cities with lat, lon, name, country, custom alias, sort order.
- **RecentSearch**: User search log with query and resolved location (cleared on demand).
- **WeatherPreference**: Preferred units (°C/°F, km/h/mph/m/s/knots, hPa/inHg/mmHg, mm/in) and quiet hour ranges.
- **WeatherSnapshot**: Persisted snapshot for offline or audit comparison.
- **ForecastCache**: Key-value cache entry with TTL, raw JSON, stale status, and source timestamp.
- **WeatherAlertRule**: Threshold rules (metric, comparator `>`, `<`, `>=`, `<=`, threshold value, window, cooldown minutes, active state).
- **AlertNotification**: Generated alert events with trigger value, dispatch status, recipient, and timestamps.
- **DataProvider**: Registry of upstream data providers, attribution text, rate limits, and endpoint URLs.
- **APIUsageRecord**: Daily and hourly call counts for budgeting and throttling.
- **WidgetConfig**: Embedded widget tokens, authorized domains, allowed metrics, and display themes.

## 3. Resilience and Fallback State Machine
1. Check Redis / DB cache for resolved `(lat, lon)` within valid TTL.
2. If cache miss, check API usage budget in `APIUsageRecord`. If budget exceeded, return cached stale data flagged as `STALE_BUDGET_EXCEEDED` or throw explicit rate limit warning.
3. Call Weather Provider Adapter with 5000ms timeout and circuit breaker (3 retries with exponential backoff).
4. If provider fails, retrieve latest cached forecast, mark as `STALE_PROVIDER_DOWN` with original generation timestamp.
5. In development/testing without internet connectivity, fallback automatically to deterministic fixture provider with UI banner "Sample Data".
