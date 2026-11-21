# Delivery Route Optimizer - Requirements Specification

## 1. Executive Summary
The Delivery Route Optimizer is an independent, multi-vehicle logistics optimization, routing dispatch, and fleet management platform. It solves complex Vehicle Routing Problems with Pickups and Deliveries (VRPPD), strict customer time windows, heterogeneous fleet capacities (weight in kg, volume in m³, package units), driver working shifts, and driver skill matrices.

## 2. Functional Requirements

### 2.1 Fleet & Depot Modeling
- **Depots**: Central distribution hubs with geocoded coordinates (WGS84), operating hours, and loading bay limits.
- **Vehicles**: Heterogeneous fleet modeling with individual license plates, vehicle types (Van, Refrigerated Truck, Cargo Bicycle, Electric Van), and multi-dimensional capacity constraints:
  - Weight capacity ($kg$)
  - Volume capacity ($m^3$)
  - Package piece count capacity
- **Drivers & Shifts**: Drivers with start/end locations, scheduled shift windows, max drive duration, mandatory break windows, and specialized qualification skills (e.g. `HAZMAT`, `REFRIGERATED`, `HEAVY_LIFT`, `WHITE_GLOVE`).

### 2.2 Order & Delivery Job Ingestion
- **Job Types**: Standard delivery, pickup, or paired shipment (pickup from location A with mandatory delivery to location B by the same vehicle).
- **Time Windows**: Hard and soft arrival windows $[t_{start}, t_{end}]$ in seconds from midnight or epoch timestamps.
- **Service Durations**: Dwell time at stops in seconds.
- **Requirements**: Required driver skills and physical package dimensions.

### 2.3 Optimization Solver Integration & Distance Matrices
- **VROOM Optimization Protocol**: Translation of business entities into VROOM solver request schemas (vehicles, jobs, shipments, matrices) and parsing of output tours.
- **Distance & Duration Engine**: OSRM routing engine integration with realistic fallback Haversine distance matrix for offline and testing resilience.
- **Objective Function**: Minimize fleet operating cost, total driving duration, and unassigned deliveries while prioritizing vehicle utilization.

### 2.4 Independent Solution Validator & Diagnostics
- **Rigorously Independent Verification**: A verification engine decoupled from the solver that verifies:
  1. No vehicle ever exceeds maximum capacity at any point along its route.
  2. Every stop is visited within its permissible time window.
  3. Precedence rules: In any shipment, pickup must strictly precede delivery.
  4. Working shift and driving limits are respected.
- **Infeasibility Diagnostics**: Detailed explanations for unassigned jobs:
  - Insufficient fleet capacity
  - Skill incompatibility
  - Impossible transit time within tight window
  - Operating shift expiration

### 2.5 Dispatch Control Tower & Driver View
- **Control Tower UI**: Real-time map displaying vehicle routes color-coded by vehicle, sequence numbers, depot markers, and traffic estimates.
- **Run Comparison**: Compare alternative optimization runs side by side (total km, total driving hours, stop efficiency, cost).
- **Driver Mobile View**: Simplified stop manifest with turn-by-turn waypoint cues, customer contact notes, and status transitions: `ASSIGNED` -> `EN_ROUTE` -> `ARRIVED` -> `DELIVERED` -> `FAILED`.

## 3. Non-Functional Requirements
- **Precision**: SI units throughout (meters, seconds, kilograms). Coordinates in WGS84 decimal degrees.
- **Deterministic Testing**: Zero network calls required for test execution.
- **Concurrency & Race Condition Prevention**: Optimistic locking preventing simultaneous dispatch publishing.
