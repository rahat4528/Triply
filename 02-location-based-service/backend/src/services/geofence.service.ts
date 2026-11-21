import {
  GeofenceEngine,
  GeofenceDefinition,
  GeofenceEvaluationState,
  LocationPing,
  GeofenceEventResult,
} from '../../../geolocation/geofence-engine';

export interface GeofenceEventLog {
  id: string;
  geofenceId: string;
  geofenceName: string;
  eventType: 'ENTER' | 'EXIT';
  latitude: number;
  longitude: number;
  accuracy: number;
  source: string;
  timestamp: string;
}

export class GeofenceService {
  private engine = new GeofenceEngine();
  private geofences: GeofenceDefinition[] = [
    {
      id: 'geo-south-bank',
      name: 'South Bank Cultural District',
      type: 'CIRCLE',
      latitude: 51.5045,
      longitude: -0.1145,
      radiusMeters: 800,
      dwellMinutes: 1,
      isActive: true,
    },
    {
      id: 'geo-westminster',
      name: 'Westminster Government Precinct',
      type: 'POLYGON',
      latitude: 51.4995,
      longitude: -0.1248,
      radiusMeters: 1000,
      polygonGeoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [-0.129, 51.502],
            [-0.121, 51.502],
            [-0.121, 51.497],
            [-0.129, 51.497],
            [-0.129, 51.502],
          ],
        ],
      }),
      dwellMinutes: 1,
      isActive: true,
    },
  ];

  private userStates = new Map<string, GeofenceEvaluationState>();
  private eventLogs: GeofenceEventLog[] = [];

  getGeofences(): GeofenceDefinition[] {
    return this.geofences;
  }

  addGeofence(geofence: Omit<GeofenceDefinition, 'id' | 'isActive'>): GeofenceDefinition {
    const newGeofence: GeofenceDefinition = {
      id: `geo-${Date.now()}`,
      ...geofence,
      isActive: true,
    };
    this.geofences.push(newGeofence);
    return newGeofence;
  }

  deleteGeofence(id: string): boolean {
    const initialLen = this.geofences.length;
    this.geofences = this.geofences.filter((g) => g.id !== id);
    return this.geofences.length < initialLen;
  }

  evaluateLocation(userId: string, ping: LocationPing): GeofenceEventResult[] {
    const triggeredEvents: GeofenceEventResult[] = [];

    for (const geofence of this.geofences) {
      if (!geofence.isActive) continue;

      const stateKey = `${userId}:${geofence.id}`;
      let state = this.userStates.get(stateKey);
      if (!state) {
        state = {
          geofenceId: geofence.id,
          userId,
          status: 'OUTSIDE',
          consecutiveHits: 0,
          lastTransition: new Date(0),
          lastPingTime: new Date(0),
        };
      }

      const { nextState, event } = this.engine.evaluate(geofence, state, ping);
      this.userStates.set(stateKey, nextState);

      if (event.eventType === 'ENTER' || event.eventType === 'EXIT') {
        triggeredEvents.push(event);
        this.eventLogs.unshift({
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          geofenceId: geofence.id,
          geofenceName: geofence.name,
          eventType: event.eventType,
          latitude: ping.latitude,
          longitude: ping.longitude,
          accuracy: ping.accuracy,
          source: ping.source,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return triggeredEvents;
  }

  getEventLogs(): GeofenceEventLog[] {
    return this.eventLogs;
  }

  clearLogs(): void {
    this.eventLogs = [];
  }
}

export const globalGeofenceService = new GeofenceService();
