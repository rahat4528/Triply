# Development Guide

## Prerequisites
- Node.js >= 18.x (v20+ recommended)
- npm or pnpm
- Docker and Docker Compose (for running containerized PostgreSQL, Redis, and MinIO)

## Running Applications
Each project is strictly independent. To run any application:
1. Navigate to the desired application directory:
   ```bash
   cd 01-weather-application
   ```
2. Follow that application's local `README.md` for environment configuration, database migration, and startup commands.
3. Start backend services:
   ```bash
   cd backend && npm install && npm run start:dev
   ```
4. Start frontend interface:
   ```bash
   cd ../frontend && npm install && npm run dev
   ```

## Testing Standards
Every project contains unit, integration, and end-to-end tests:
- `npm test` runs unit and integration test suites.
- Provider adapters feature deterministic mock fixtures for offline execution.
