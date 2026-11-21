/**
 * Realistic seed script for Delivery Route Optimizer
 * Seed includes a central logistics distribution depot, heterogeneous fleet,
 * certified drivers with skills, customer delivery jobs with time windows,
 * and an existing baseline optimization run.
 */

export interface SeedData {
  depots: Array<{
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    openSeconds: number;
    closeSeconds: number;
  }>;
  drivers: Array<{
    id: string;
    name: string;
    phone: string;
    licenseNumber: string;
    skills: string[];
    maxShiftDurationSec: number;
  }>;
  vehicles: Array<{
    id: string;
    code: string;
    name: string;
    vehicleType: 'VAN' | 'TRUCK_REFRIGERATED' | 'CARGO_BIKE' | 'ELECTRIC_VAN';
    capacityKg: number;
    capacityM3: number;
    capacityPieces: number;
    currentDepotId: string;
    assignedDriverId: string;
    status: 'AVAILABLE' | 'DISPATCHED' | 'MAINTENANCE';
  }>;
  jobs: Array<{
    id: string;
    trackingCode: string;
    customerName: string;
    address: string;
    latitude: number;
    longitude: number;
    demandKg: number;
    demandM3: number;
    demandPieces: number;
    timeWindowStartSec: number;
    timeWindowEndSec: number;
    serviceDurationSec: number;
    requiredSkills: string[];
    jobType: 'DELIVERY' | 'PICKUP';
    status: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'FAILED';
  }>;
}

export const seedData: SeedData = {
  depots: [
    {
      id: 'depot-central-01',
      name: 'Triply Metro Central Distribution Hub',
      address: '100 Logistics Way, Seattle, WA 98104',
      latitude: 47.6062,
      longitude: -122.3321,
      openSeconds: 21600, // 06:00
      closeSeconds: 75600  // 21:00
    }
  ],
  drivers: [
    {
      id: 'drv-01',
      name: 'Arthur Pendelton',
      phone: '+1-206-555-0144',
      licenseNumber: 'CDL-WA-883491',
      skills: ['REFRIGERATED', 'HAZMAT'],
      maxShiftDurationSec: 32400
    },
    {
      id: 'drv-02',
      name: 'Kendra Morales',
      phone: '+1-206-555-0178',
      licenseNumber: 'CDL-WA-772910',
      skills: ['WHITE_GLOVE', 'HEAVY_LIFT'],
      maxShiftDurationSec: 32400
    },
    {
      id: 'drv-03',
      name: 'Tariq Al-Mansoor',
      phone: '+1-206-555-0211',
      licenseNumber: 'CDL-WA-994123',
      skills: ['EXPRESS'],
      maxShiftDurationSec: 28800
    }
  ],
  vehicles: [
    {
      id: 'veh-01',
      code: 'FLEET-VAN-01',
      name: 'Mercedes Sprinter High-Roof',
      vehicleType: 'VAN',
      capacityKg: 1400,
      capacityM3: 11.5,
      capacityPieces: 65,
      currentDepotId: 'depot-central-01',
      assignedDriverId: 'drv-01',
      status: 'AVAILABLE'
    },
    {
      id: 'veh-02',
      code: 'FLEET-REEFER-02',
      name: 'Isuzu Thermo-King Reefer 16ft',
      vehicleType: 'TRUCK_REFRIGERATED',
      capacityKg: 2800,
      capacityM3: 18.0,
      capacityPieces: 120,
      currentDepotId: 'depot-central-01',
      assignedDriverId: 'drv-02',
      status: 'AVAILABLE'
    },
    {
      id: 'veh-03',
      code: 'FLEET-EVAN-03',
      name: 'Rivian Commercial Delivery EDV',
      vehicleType: 'ELECTRIC_VAN',
      capacityKg: 950,
      capacityM3: 8.5,
      capacityPieces: 45,
      currentDepotId: 'depot-central-01',
      assignedDriverId: 'drv-03',
      status: 'AVAILABLE'
    }
  ],
  jobs: [
    {
      id: 'job-01',
      trackingCode: 'TRK-SEA-1001',
      customerName: 'Pike Place Organic Market',
      address: '1531 Western Ave, Seattle, WA',
      latitude: 47.6085,
      longitude: -122.3412,
      demandKg: 120,
      demandM3: 1.2,
      demandPieces: 8,
      timeWindowStartSec: 28800, // 08:00
      timeWindowEndSec: 36000,   // 10:00 (strict morning)
      serviceDurationSec: 600,
      requiredSkills: ['REFRIGERATED'],
      jobType: 'DELIVERY',
      status: 'PENDING'
    },
    {
      id: 'job-02',
      trackingCode: 'TRK-SEA-1002',
      customerName: 'Capitol Hill Artisan Roasters',
      address: '1122 E Pike St, Seattle, WA',
      latitude: 47.6142,
      longitude: -122.3168,
      demandKg: 85,
      demandM3: 0.8,
      demandPieces: 5,
      timeWindowStartSec: 32400, // 09:00
      timeWindowEndSec: 46800,   // 13:00
      serviceDurationSec: 450,
      requiredSkills: [],
      jobType: 'DELIVERY',
      status: 'PENDING'
    },
    {
      id: 'job-03',
      trackingCode: 'TRK-SEA-1003',
      customerName: 'South Lake Union Biotech Labs',
      address: '500 Fairview Ave N, Seattle, WA',
      latitude: 47.6231,
      longitude: -122.3338,
      demandKg: 40,
      demandM3: 0.4,
      demandPieces: 2,
      timeWindowStartSec: 36000, // 10:00
      timeWindowEndSec: 50400,   // 14:00
      serviceDurationSec: 300,
      requiredSkills: ['HAZMAT'],
      jobType: 'DELIVERY',
      status: 'PENDING'
    },
    {
      id: 'job-04',
      trackingCode: 'TRK-SEA-1004',
      customerName: 'Ballard Marine Hardware',
      address: '5300 Ballard Ave NW, Seattle, WA',
      latitude: 47.6664,
      longitude: -122.3831,
      demandKg: 240,
      demandM3: 2.1,
      demandPieces: 12,
      timeWindowStartSec: 39600, // 11:00
      timeWindowEndSec: 57600,   // 16:00
      serviceDurationSec: 900,
      requiredSkills: ['HEAVY_LIFT'],
      jobType: 'DELIVERY',
      status: 'PENDING'
    },
    {
      id: 'job-05',
      trackingCode: 'TRK-SEA-1005',
      customerName: 'Fremont Craft Brewery Depot',
      address: '1050 N 34th St, Seattle, WA',
      latitude: 47.6493,
      longitude: -122.3444,
      demandKg: 180,
      demandM3: 1.5,
      demandPieces: 6,
      timeWindowStartSec: 43200, // 12:00
      timeWindowEndSec: 61200,   // 17:00
      serviceDurationSec: 600,
      requiredSkills: [],
      jobType: 'DELIVERY',
      status: 'PENDING'
    },
    {
      id: 'job-06',
      trackingCode: 'TRK-SEA-1006',
      customerName: 'University Village Retailer',
      address: '2623 NE University Village St, Seattle, WA',
      latitude: 47.6628,
      longitude: -122.2989,
      demandKg: 95,
      demandM3: 0.9,
      demandPieces: 7,
      timeWindowStartSec: 46800, // 13:00
      timeWindowEndSec: 64800,   // 18:00
      serviceDurationSec: 480,
      requiredSkills: ['WHITE_GLOVE'],
      jobType: 'DELIVERY',
      status: 'PENDING'
    }
  ]
};
