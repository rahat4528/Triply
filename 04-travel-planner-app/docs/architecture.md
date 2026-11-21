# Travel Planner Application - Architecture Specification

## 1. System Overview
The Travel Planner Application follows an independent, modular architecture. It contains its own Next.js frontend, Node.js/Express backend, dedicated PostgreSQL database (`triply_travel_planner_db`), Redis cache for invitation tokens and session storage, and S3-compatible document storage (MinIO).

```
+-----------------------------------------------------------+
|                    Next.js Frontend                       |
|   (Trip Dashboard, Timeline, Budget Tracker, Map Panel)   |
+-----------------------------------------------------------+
                             | REST & JSON
                             v
+-----------------------------------------------------------+
|                 Express / Node.js Backend                 |
|  +---------------------+  +----------------------------+  |
|  | Itinerary Service   |  | Budget Arithmetic Engine   |  |
|  +---------------------+  +----------------------------+  |
|  +---------------------+  +----------------------------+  |
|  | TimeZone Calculator |  | RFC 5545 iCal Exporter     |  |
|  +---------------------+  +----------------------------+  |
|  +---------------------+  +----------------------------+  |
|  | Collaboration & RBAC|  | Document Vault Adapter     |  |
|  +---------------------+  +----------------------------+  |
+-----------------------------------------------------------+
       |                           |                |
       v                           v                v
+------------------+       +---------------+   +------------+
| PostgreSQL /     |       | Redis         |   | MinIO S3   |
| Prisma ORM       |       | (Tokens/Cache)|   | (Documents)|
| triply_travel_   |       +---------------+   +------------+
| planner_db       |
+------------------+
```

## 2. Core Modules & Engine Design

### 2.1 TimeZone & Date Line Engine (`integrations/timezone-calculator.ts`)
- Manages timezone offsets, Daylight Saving Time (DST) transitions, and cross-antimeridian travel (e.g., flights departing Tokyo UTC+9 on Monday arriving San Francisco UTC-7 on Sunday).
- Calculates true elapsed duration between origin and destination timestamps.
- Generates correct inclusive day intervals for multi-destination trips.

### 2.2 Budget & Currency Arithmetic Engine (`integrations/budget-arithmetic.ts`)
- Stores all monetary amounts in integer minor units (e.g., $10.50 -> 1050 cents).
- Implements exact round-trip decimal arithmetic without IEEE 754 float inaccuracies.
- Multi-currency rate conversion matrix supporting base trip currency conversion and companion split calculations.

### 2.3 RFC 5545 iCalendar Exporter (`integrations/ical-generator.ts`)
- Builds valid iCalendar `.ics` files compliant with RFC 5545.
- Emits proper `BEGIN:VCALENDAR`, `VERSION:2.0`, `PRODID:-//Triply//Travel Planner 1.0//EN`, `BEGIN:VEVENT`, `UID`, `DTSTART`, `DTEND`, `GEO`, `SUMMARY`, and `DESCRIPTION`.
- Formats timestamps in UTC (`Z` suffix) or local timezone representation.

### 2.4 Collaboration & RBAC Service
- Role hierarchy: `OWNER` > `EDITOR` > `VIEWER`.
- Enforces strict permission checks on all mutation endpoints.
- Generates cryptographically secure invitation tokens (hex 32 bytes) with defined TTL.

## 3. Database Schema Overview
Dedicated schema `triply_travel_planner_db`:
- `User`: Travelers and collaborators.
- `Trip`: Core travel project with title, description, start/end dates, base currency, and budget limit.
- `TripMember`: Associate user with trip and role (`OWNER`, `EDITOR`, `VIEWER`).
- `Destination`: Waypoints and primary cities with coordinates and timezones.
- `ItineraryDay`: Sequenced day container for a trip.
- `ItineraryItem`: Specific activities, transports, lodgings, or dining events.
- `TripExpense`: Monetary expenditure with minor units, currency, payer, and category.
- `TripInvitation`: Pending collaboration invites with cryptographic token and expiration.
- `ChecklistItem`: Pre-travel packing and preparation tasks.
- `ActivityLog`: Historical record of changes.
