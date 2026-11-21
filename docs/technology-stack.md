# Technology Stack

The five applications utilize modern, industry-standard TypeScript/Node.js and React ecosystems:

## Frontend Stack
- **Framework**: Next.js 14 / React 18 / Vite SPA where appropriate
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS, Lucide Icons
- **Visualizations & Maps**: MapLibre GL JS, deck.gl, Recharts, Turf.js
- **State & Querying**: TanStack Query / React Context

## Backend Stack
- **Server Frameworks**: NestJS / Express / Node.js HTTP
- **ORM & Data Access**: Prisma ORM, raw SQL with PostGIS geospatial queries
- **Cache & Message Queues**: Redis, BullMQ
- **Validation**: Zod, class-validator

## Storage & Compute
- **Relational Databases**: PostgreSQL 16 + PostGIS 3.4
- **Object Storage**: S3-compatible storage (MinIO for local environments)
- **Solver & Routing**: VROOM and OSRM for logistics route optimization
