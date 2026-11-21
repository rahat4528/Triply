import { GeofenceEngine, GeofenceDefinition, GeofenceEvaluationState } from '../geolocation/geofence-engine';

describe('Geofence Engine (Accuracy Awareness, Hysteresis, Enter/Exit)', () => {
  const engine = new GeofenceEngine();
  const circleGeofence: GeofenceDefinition = {
    id: 'geo-test-01',
    name: 'Test Park',
    type: 'CIRCLE',
    latitude: 51.5045,
    longitude: -0.1145,
    radiusMeters: 500,
    isActive: true,
  };

  const initialState: GeofenceEvaluationState = {
    geofenceId: circleGeofence.id,
    userId: 'user-01',
    status: 'OUTSIDE',
    consecutiveHits: 0,
    lastTransition: new Date(1000),
    lastPingTime: new Date(1000),
  };

  it('rejects samples with coarse accuracy exceeding 50% of geofence radius', () => {
    const { nextState, event } = engine.evaluate(circleGeofence, initialState, {
      latitude: 51.5045,
      longitude: -0.1145,
      accuracy: 300, // > 500 * 0.5 (250m)
      source: 'DEVICE',
      timestamp: new Date(2000),
    });

    expect(event.eventType).toBe('DROPPED_COARSE_ACCURACY');
    expect(nextState.status).toBe('OUTSIDE');
  });

  it('applies hysteresis requiring two consecutive samples before triggering ENTER', () => {
    // First sample inside
    const step1 = engine.evaluate(circleGeofence, initialState, {
      latitude: 51.5045,
      longitude: -0.1145,
      accuracy: 15,
      source: 'DEVICE',
      timestamp: new Date(3000),
    });

    expect(step1.event.eventType).toBe('NOOP');
    expect(step1.event.message).toContain('Hysteresis');
    expect(step1.nextState.consecutiveHits).toBe(1);
    expect(step1.nextState.status).toBe('OUTSIDE');

    // Second consecutive sample inside -> triggers ENTER
    const step2 = engine.evaluate(circleGeofence, step1.nextState, {
      latitude: 51.5045,
      longitude: -0.1145,
      accuracy: 10,
      source: 'DEVICE',
      timestamp: new Date(4000),
    });

    expect(step2.event.eventType).toBe('ENTER');
    expect(step2.nextState.status).toBe('INSIDE');
    expect(step2.event.message).toContain('Entered Test Park');
  });

  it('triggers EXIT immediately when moving outside', () => {
    const insideState: GeofenceEvaluationState = {
      geofenceId: circleGeofence.id,
      userId: 'user-01',
      status: 'INSIDE',
      consecutiveHits: 2,
      lastTransition: new Date(4000),
      lastPingTime: new Date(4000),
    };

    const stepExit = engine.evaluate(circleGeofence, insideState, {
      latitude: 51.5500, // Far outside
      longitude: -0.1145,
      accuracy: 15,
      source: 'DEVICE',
      timestamp: new Date(5000),
    });

    expect(stepExit.event.eventType).toBe('EXIT');
    expect(stepExit.nextState.status).toBe('OUTSIDE');
  });

  it('rejects out-of-order pings based on timestamp', () => {
    const recentState: GeofenceEvaluationState = {
      geofenceId: circleGeofence.id,
      userId: 'user-01',
      status: 'OUTSIDE',
      consecutiveHits: 0,
      lastTransition: new Date(10000),
      lastPingTime: new Date(10000),
    };

    const outOfOrder = engine.evaluate(circleGeofence, recentState, {
      latitude: 51.5045,
      longitude: -0.1145,
      accuracy: 15,
      source: 'DEVICE',
      timestamp: new Date(5000), // Older timestamp!
    });

    expect(outOfOrder.event.eventType).toBe('OUT_OF_ORDER');
  });
});
