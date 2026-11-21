import { calculateGeodesicDistance, isPointInCircle, isPointInPolygon } from './geodesic';

export type LocationSource = 'DEVICE' | 'MANUAL' | 'SIMULATED';

export interface LocationPing {
  latitude: number;
  longitude: number;
  accuracy: number; // radius in meters
  source: LocationSource;
  timestamp: Date;
  clientUpdateId?: string;
}

export interface GeofenceDefinition {
  id: string;
  name: string;
  type: 'CIRCLE' | 'POLYGON';
  latitude: number;
  longitude: number;
  radiusMeters: number;
  polygonGeoJson?: string | null;
  dwellMinutes?: number;
  isActive: boolean;
}

export interface GeofenceEvaluationState {
  geofenceId: string;
  userId: string;
  status: 'INSIDE' | 'OUTSIDE';
  consecutiveHits: number;
  lastTransition: Date;
  lastPingTime: Date;
}

export interface GeofenceEventResult {
  eventType: 'ENTER' | 'EXIT' | 'DWELL' | 'NOOP' | 'DROPPED_COARSE_ACCURACY' | 'OUT_OF_ORDER';
  geofenceId: string;
  geofenceName: string;
  userId: string;
  source: LocationSource;
  accuracy: number;
  message?: string;
}

export class GeofenceEngine {
  private processedUpdateIds = new Set<string>();

  /**
   * Evaluates location ping against a geofence with:
   * 1. Accuracy awareness: Drops samples where accuracy > geofence radius * 0.5.
   * 2. Idempotency: Rejects duplicate clientUpdateIds.
   * 3. Timestamp ordering: Rejects updates older than lastPingTime.
   * 4. Hysteresis: Requires 2 consecutive inside hits before triggering ENTER.
   */
  evaluate(
    geofence: GeofenceDefinition,
    state: GeofenceEvaluationState,
    ping: LocationPing
  ): { nextState: GeofenceEvaluationState; event: GeofenceEventResult } {
    // 1. Idempotency check
    if (ping.clientUpdateId) {
      if (this.processedUpdateIds.has(ping.clientUpdateId)) {
        return {
          nextState: state,
          event: {
            eventType: 'NOOP',
            geofenceId: geofence.id,
            geofenceName: geofence.name,
            userId: state.userId,
            source: ping.source,
            accuracy: ping.accuracy,
            message: 'Duplicate update ID ignored.',
          },
        };
      }
      this.processedUpdateIds.add(ping.clientUpdateId);
    }

    // 2. Out-of-order timestamp check
    if (ping.timestamp.getTime() < state.lastPingTime.getTime()) {
      return {
        nextState: state,
        event: {
          eventType: 'OUT_OF_ORDER',
          geofenceId: geofence.id,
          geofenceName: geofence.name,
          userId: state.userId,
          source: ping.source,
          accuracy: ping.accuracy,
          message: 'Out-of-order ping rejected.',
        },
      };
    }

    // 3. Accuracy filtering
    const effectiveRadius = geofence.type === 'CIRCLE' ? geofence.radiusMeters : 500;
    if (ping.accuracy > effectiveRadius * 0.5) {
      return {
        nextState: { ...state, lastPingTime: ping.timestamp },
        event: {
          eventType: 'DROPPED_COARSE_ACCURACY',
          geofenceId: geofence.id,
          geofenceName: geofence.name,
          userId: state.userId,
          source: ping.source,
          accuracy: ping.accuracy,
          message: `Accuracy radius (${ping.accuracy}m) is too coarse for geofence size (${effectiveRadius}m).`,
        },
      };
    }

    // 4. Spatial containment check
    let isInside = false;
    if (geofence.type === 'CIRCLE') {
      isInside = isPointInCircle(
        ping.latitude,
        ping.longitude,
        geofence.latitude,
        geofence.longitude,
        geofence.radiusMeters
      );
    } else if (geofence.type === 'POLYGON' && geofence.polygonGeoJson) {
      try {
        const parsed = JSON.parse(geofence.polygonGeoJson);
        const coords = parsed.type === 'Feature' ? parsed.geometry.coordinates : parsed.coordinates;
        isInside = isPointInPolygon(ping.latitude, ping.longitude, coords);
      } catch {
        isInside = false;
      }
    }

    // 5. State transitions with hysteresis
    if (isInside) {
      if (state.status === 'OUTSIDE') {
        const nextHits = state.consecutiveHits + 1;
        if (nextHits >= 2) {
          // ENTER condition verified
          return {
            nextState: {
              ...state,
              status: 'INSIDE',
              consecutiveHits: nextHits,
              lastTransition: ping.timestamp,
              lastPingTime: ping.timestamp,
            },
            event: {
              eventType: 'ENTER',
              geofenceId: geofence.id,
              geofenceName: geofence.name,
              userId: state.userId,
              source: ping.source,
              accuracy: ping.accuracy,
              message: `Entered ${geofence.name} (Source: ${ping.source})`,
            },
          };
        } else {
          return {
            nextState: {
              ...state,
              consecutiveHits: nextHits,
              lastPingTime: ping.timestamp,
            },
            event: {
              eventType: 'NOOP',
              geofenceId: geofence.id,
              geofenceName: geofence.name,
              userId: state.userId,
              source: ping.source,
              accuracy: ping.accuracy,
              message: 'Hysteresis: waiting for second consecutive sample.',
            },
          };
        }
      } else {
        // Already inside -> Dwell
        return {
          nextState: { ...state, lastPingTime: ping.timestamp },
          event: {
            eventType: 'DWELL',
            geofenceId: geofence.id,
            geofenceName: geofence.name,
            userId: state.userId,
            source: ping.source,
            accuracy: ping.accuracy,
          },
        };
      }
    } else {
      // Point is outside
      if (state.status === 'INSIDE') {
        return {
          nextState: {
            ...state,
            status: 'OUTSIDE',
            consecutiveHits: 0,
            lastTransition: ping.timestamp,
            lastPingTime: ping.timestamp,
          },
          event: {
            eventType: 'EXIT',
            geofenceId: geofence.id,
            geofenceName: geofence.name,
            userId: state.userId,
            source: ping.source,
            accuracy: ping.accuracy,
            message: `Exited ${geofence.name} (Source: ${ping.source})`,
          },
        };
      } else {
        return {
          nextState: { ...state, consecutiveHits: 0, lastPingTime: ping.timestamp },
          event: {
            eventType: 'NOOP',
            geofenceId: geofence.id,
            geofenceName: geofence.name,
            userId: state.userId,
            source: ping.source,
            accuracy: ping.accuracy,
          },
        };
      }
    }
  }
}
