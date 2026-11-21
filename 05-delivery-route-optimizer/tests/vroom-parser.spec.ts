import { VroomResponseParser } from '../optimization-engine/vroom-parser';

describe('VroomResponseParser', () => {
  it('parses successful VROOM solver JSON into structured routes and steps', () => {
    const mockVroomOutput = {
      code: 0,
      summary: {
        cost: 4500,
        routes: 1,
        unassigned: 0,
        delivery: [120, 1200, 8],
        amount: [120, 1200, 8],
        pickup: [0, 0, 0],
        service: 600,
        duration: 2400,
        waiting_time: 0,
        priority: 0,
        distance: 14200
      },
      unassigned: [],
      routes: [
        {
          vehicle: 1,
          cost: 4500,
          service: 600,
          duration: 2400,
          distance: 14200,
          steps: [
            {
              type: 'start',
              location: [-122.3321, 47.6062],
              load: [120, 1200, 8],
              arrival: 28800,
              duration: 0,
              distance: 0
            },
            {
              type: 'job',
              location: [-122.3412, 47.6085],
              id: 1,
              service: 600,
              waiting_time: 0,
              arrival: 29400,
              duration: 600,
              distance: 3500,
              load: [0, 0, 0]
            },
            {
              type: 'end',
              location: [-122.3321, 47.6062],
              arrival: 31200,
              duration: 2400,
              distance: 14200,
              load: [0, 0, 0]
            }
          ]
        }
      ]
    };

    const vehicleIdMap = new Map([[1, 'veh-01']]);
    const jobIdMap = new Map([[1, 'job-01']]);

    const solution = VroomResponseParser.parse(mockVroomOutput, vehicleIdMap, jobIdMap);

    expect(solution.code).toBe(0);
    expect(solution.totalDistanceMeters).toBe(14200);
    expect(solution.routes).toHaveLength(1);
    expect(solution.routes[0].vehicleId).toBe('veh-01');
    expect(solution.routes[0].steps).toHaveLength(3);
    expect(solution.routes[0].steps[1].jobId).toBe('job-01');
    expect(solution.unassignedJobIds).toHaveLength(0);
  });

  it('captures unassigned jobs accurately', () => {
    const mockOutput = {
      code: 0,
      summary: { distance: 0, duration: 0, cost: 0 },
      unassigned: [
        { id: 4, description: 'job-oversized-99' }
      ],
      routes: []
    };

    const solution = VroomResponseParser.parse(mockOutput, new Map(), new Map([[4, 'job-oversized-99']]));
    expect(solution.unassignedJobIds).toEqual(['job-oversized-99']);
  });
});
