import { VroomRequestBuilder, VehicleInput, JobInput } from '../optimization-engine/vroom-builder';

describe('VroomRequestBuilder', () => {
  it('translates vehicles into standard VROOM JSON structure', () => {
    const builder = new VroomRequestBuilder();
    const vehicles: VehicleInput[] = [
      {
        id: 'veh-01',
        depotLat: 47.6062,
        depotLon: -122.3321,
        capacityKg: 1000,
        capacityM3: 8.5,
        capacityPieces: 50,
        timeWindowStartSec: 28800,
        timeWindowEndSec: 64800,
        skills: ['REFRIGERATED']
      }
    ];

    const payload = builder.buildPayload(vehicles, []);

    expect(payload.vehicles).toHaveLength(1);
    expect(payload.vehicles[0].id).toBe(1);
    expect(payload.vehicles[0].start).toEqual([-122.3321, 47.6062]); // GeoJSON order [lon, lat]
    expect(payload.vehicles[0].capacity).toEqual([1000, 8500, 50]); // 8.5 m3 -> 8500 dm3
    expect(payload.vehicles[0].time_window).toEqual([28800, 64800]);
    expect(payload.vehicles[0].skills).toBeDefined();
    expect(payload.vehicles[0].description).toBe('veh-01');
  });

  it('translates jobs with pickup vs delivery demand vectors', () => {
    const builder = new VroomRequestBuilder();
    const jobs: JobInput[] = [
      {
        id: 'job-01',
        latitude: 47.6085,
        longitude: -122.3412,
        demandKg: 100,
        demandM3: 1.0,
        demandPieces: 5,
        timeWindowStartSec: 32400,
        timeWindowEndSec: 36000,
        serviceDurationSec: 300,
        jobType: 'DELIVERY'
      },
      {
        id: 'job-02',
        latitude: 47.6142,
        longitude: -122.3168,
        demandKg: 50,
        demandM3: 0.5,
        demandPieces: 2,
        timeWindowStartSec: 36000,
        timeWindowEndSec: 43200,
        serviceDurationSec: 400,
        jobType: 'PICKUP'
      }
    ];

    const payload = builder.buildPayload([], jobs);

    expect(payload.jobs).toHaveLength(2);
    expect(payload.jobs[0].delivery).toEqual([100, 1000, 5]);
    expect(payload.jobs[0].pickup).toBeUndefined();
    expect(payload.jobs[1].pickup).toEqual([50, 500, 2]);
    expect(payload.jobs[1].delivery).toBeUndefined();
  });

  it('maps skills consistently between vehicles and jobs', () => {
    const builder = new VroomRequestBuilder();
    const skillAId = builder.getSkillId('HAZMAT');
    const skillBId = builder.getSkillId('REFRIGERATED');
    const skillAIdSecond = builder.getSkillId('HAZMAT');

    expect(skillAId).toBe(skillAIdSecond);
    expect(skillAId).not.toBe(skillBId);
  });
});
