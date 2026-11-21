# Travel Planner Application - API Specification

## 1. Overview
Base URL: `/api/v1`
Protocol: HTTP/1.1 REST
Content-Type: `application/json`

## 2. Endpoints

### 2.1 Trips
- `GET /api/v1/trips`
  - Returns list of trips accessible by user.
- `POST /api/v1/trips`
  - Create a new trip.
  - Body: `{ title, description, startDate, endDate, baseCurrency, budgetLimitMinor }`
- `GET /api/v1/trips/:id`
  - Get trip details including destinations, days, and companion summary.
- `PUT /api/v1/trips/:id`
  - Update trip details (Requires `OWNER` or `EDITOR`).
- `DELETE /api/v1/trips/:id`
  - Delete trip (Requires `OWNER`).

### 2.2 Itinerary Days & Items
- `GET /api/v1/trips/:tripId/itinerary`
  - Returns full sequenced day-by-day itinerary with items.
- `POST /api/v1/trips/:tripId/days`
  - Add or generate days for a date range.
- `POST /api/v1/trips/:tripId/items`
  - Add an itinerary item (Activity, Lodging, Transport, Dining).
  - Body: `{ dayId, title, itemType, startTime, endTime, latitude, longitude, locationName, costMinor, currency, notes }`
- `PUT /api/v1/trips/:tripId/items/:itemId`
  - Update itinerary item details.
- `DELETE /api/v1/trips/:tripId/items/:itemId`
  - Remove itinerary item.

### 2.3 Expenses & Budgeting
- `GET /api/v1/trips/:tripId/expenses`
  - Returns expenses list and budget summary (total spent, remaining, category breakdown).
- `POST /api/v1/trips/:tripId/expenses`
  - Record an expense.
  - Body: `{ description, amountMinor, currency, category, date, paidByUserId, splitType }`
- `DELETE /api/v1/trips/:tripId/expenses/:expenseId`
  - Delete an expense.

### 2.4 Collaboration & Invitations
- `GET /api/v1/trips/:tripId/members`
  - List trip companions and assigned roles.
- `POST /api/v1/trips/:tripId/invitations`
  - Create an invitation token.
  - Body: `{ email, role: "EDITOR" | "VIEWER", expiresInHours }`
- `POST /api/v1/invitations/accept`
  - Accept an invitation using token: `{ token, userId }`
- `DELETE /api/v1/trips/:tripId/members/:memberId`
  - Remove a companion (Requires `OWNER`).

### 2.5 Calendar Export & Tools
- `GET /api/v1/trips/:tripId/calendar.ics`
  - Returns standard RFC 5545 iCalendar file (`text/calendar`).
- `GET /api/v1/trips/:tripId/checklist`
  - Get packing and preparation checklist.
- `POST /api/v1/trips/:tripId/checklist`
  - Add checklist item.
- `PATCH /api/v1/trips/:tripId/checklist/:itemId`
  - Toggle checklist item completion.
