/**
 * Seed script for Triply Travel Planner Application
 * Provides realistic, comprehensive multi-destination trip with activities,
 * expenses in minor units, companions with roles, and packing checklist.
 */

export interface SeedData {
  users: Array<{ id: string; email: string; name: string; avatarUrl?: string }>;
  trips: Array<{
    id: string;
    title: string;
    description: string;
    coverImage: string;
    startDate: string;
    endDate: string;
    baseCurrency: string;
    budgetLimitMinor: number;
    createdById: string;
    destinations: Array<{
      id: string;
      name: string;
      countryCode: string;
      latitude: number;
      longitude: number;
      timezone: string;
      sequence: number;
    }>;
    members: Array<{
      id: string;
      userId: string;
      role: 'OWNER' | 'EDITOR' | 'VIEWER';
    }>;
    days: Array<{
      id: string;
      dayNumber: number;
      date: string;
      title: string;
      items: Array<{
        id: string;
        title: string;
        itemType: 'ACTIVITY' | 'LODGING' | 'TRANSPORT' | 'DINING' | 'CUSTOM';
        startTime: string;
        endTime: string;
        timezone: string;
        latitude: number;
        longitude: number;
        locationName: string;
        costMinor: number;
        currency: string;
        bookingReference?: string;
        notes?: string;
      }>;
    }>;
    expenses: Array<{
      id: string;
      description: string;
      amountMinor: number;
      currency: string;
      category: 'ACCOMMODATION' | 'TRANSPORT' | 'MEALS' | 'ACTIVITIES' | 'SHOPPING' | 'FEES' | 'OTHER';
      date: string;
      paidByUserId: string;
      exchangeRateToBase: number;
      amountInBaseCurrencyMinor: number;
    }>;
    checklist: Array<{
      id: string;
      title: string;
      category: string;
      isCompleted: boolean;
      assignedToUserId?: string;
    }>;
  }>;
}

export const seedData: SeedData = {
  users: [
    { id: 'usr-travel-01', email: 'elena.rostova@example.com', name: 'Elena Rostova', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { id: 'usr-travel-02', email: 'marcus.vance@example.com', name: 'Marcus Vance', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    { id: 'usr-travel-03', email: 'sophia.chen@example.com', name: 'Sophia Chen', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
  ],
  trips: [
    {
      id: 'trip-japan-alpine-2026',
      title: 'Alpine Japan & Coastal Kansai Expedition',
      description: 'An immersive 8-day journey through Tokyo, the Japanese Alps in Takayama, and historic Kyoto.',
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200',
      startDate: '2026-10-10T00:00:00.000Z',
      endDate: '2026-10-18T00:00:00.000Z',
      baseCurrency: 'USD',
      budgetLimitMinor: 450000, // $4,500.00 USD
      createdById: 'usr-travel-01',
      destinations: [
        {
          id: 'dest-01',
          name: 'Tokyo',
          countryCode: 'JP',
          latitude: 35.6762,
          longitude: 139.6503,
          timezone: 'Asia/Tokyo',
          sequence: 1
        },
        {
          id: 'dest-02',
          name: 'Takayama (Gifu Alps)',
          countryCode: 'JP',
          latitude: 36.1461,
          longitude: 137.2522,
          timezone: 'Asia/Tokyo',
          sequence: 2
        },
        {
          id: 'dest-03',
          name: 'Kyoto',
          countryCode: 'JP',
          latitude: 35.0116,
          longitude: 135.7681,
          timezone: 'Asia/Tokyo',
          sequence: 3
        }
      ],
      members: [
        { id: 'mem-01', userId: 'usr-travel-01', role: 'OWNER' },
        { id: 'mem-02', userId: 'usr-travel-02', role: 'EDITOR' },
        { id: 'mem-03', userId: 'usr-travel-03', role: 'VIEWER' }
      ],
      days: [
        {
          id: 'day-01',
          dayNumber: 1,
          date: '2026-10-10T00:00:00.000Z',
          title: 'Arrival & Shinjuku Nightfall',
          items: [
            {
              id: 'item-01-01',
              title: 'Flight Arrival: SFO -> HND',
              itemType: 'TRANSPORT',
              startTime: '2026-10-10T14:30:00.000Z',
              endTime: '2026-10-10T16:00:00.000Z',
              timezone: 'Asia/Tokyo',
              latitude: 35.5494,
              longitude: 139.7798,
              locationName: 'Haneda International Airport (HND)',
              costMinor: 112000,
              currency: 'USD',
              bookingReference: 'JL001-C7',
              notes: 'Clear customs and collect Pocket Wi-Fi router from terminal counter.'
            },
            {
              id: 'item-01-02',
              title: 'Hotel Check-In: Shinjuku Granbell',
              itemType: 'LODGING',
              startTime: '2026-10-10T17:30:00.000Z',
              endTime: '2026-10-10T18:30:00.000Z',
              timezone: 'Asia/Tokyo',
              latitude: 35.6961,
              longitude: 139.7056,
              locationName: 'Shinjuku Granbell Hotel',
              costMinor: 48000,
              currency: 'USD',
              bookingReference: 'BK-GRAN-884'
            },
            {
              id: 'item-01-03',
              title: 'Omoide Yokocho Yakitori Dinner',
              itemType: 'DINING',
              startTime: '2026-10-10T19:30:00.000Z',
              endTime: '2026-10-10T21:30:00.000Z',
              timezone: 'Asia/Tokyo',
              latitude: 35.6932,
              longitude: 139.6997,
              locationName: 'Omoide Yokocho Alleyway',
              costMinor: 6500,
              currency: 'JPY',
              notes: 'Cash only. Atmospheric traditional charcoal grill dining.'
            }
          ]
        },
        {
          id: 'day-02',
          dayNumber: 2,
          date: '2026-10-11T00:00:00.000Z',
          title: 'Cultural Heritage in Asakusa & Akihabara Tech',
          items: [
            {
              id: 'item-02-01',
              title: 'Senso-ji Temple Morning Walk',
              itemType: 'ACTIVITY',
              startTime: '2026-10-11T08:30:00.000Z',
              endTime: '2026-10-11T11:00:00.000Z',
              timezone: 'Asia/Tokyo',
              latitude: 35.7148,
              longitude: 139.7967,
              locationName: 'Senso-ji Temple, Asakusa',
              costMinor: 0,
              currency: 'JPY',
              notes: 'Oldest Buddhist temple in Tokyo. Nakamise shopping street treats.'
            },
            {
              id: 'item-02-02',
              title: 'Matcha Tasting & Sweets at Suzukien',
              itemType: 'DINING',
              startTime: '2026-10-11T11:30:00.000Z',
              endTime: '2026-10-11T12:30:00.000Z',
              timezone: 'Asia/Tokyo',
              latitude: 35.7176,
              longitude: 139.7969,
              locationName: 'Suzukien Asakusa',
              costMinor: 1600,
              currency: 'JPY'
            }
          ]
        },
        {
          id: 'day-03',
          dayNumber: 3,
          date: '2026-10-12T00:00:00.000Z',
          title: 'Limited Express Train to Hida-Takayama',
          items: [
            {
              id: 'item-03-01',
              title: 'JR Limited Express Hida Wide View',
              itemType: 'TRANSPORT',
              startTime: '2026-10-12T08:00:00.000Z',
              endTime: '2026-10-12T12:30:00.000Z',
              timezone: 'Asia/Tokyo',
              latitude: 36.1413,
              longitude: 137.2514,
              locationName: 'Takayama Station',
              costMinor: 31000,
              currency: 'JPY',
              bookingReference: 'JR-HIDA-441',
              notes: 'Panoramic windows through the Hida river gorges.'
            },
            {
              id: 'item-03-02',
              title: 'Sanmachi Suji Historic District Walk',
              itemType: 'ACTIVITY',
              startTime: '2026-10-12T14:00:00.000Z',
              endTime: '2026-10-12T17:00:00.000Z',
              timezone: 'Asia/Tokyo',
              latitude: 36.1425,
              longitude: 137.2589,
              locationName: 'Sanmachi Suji Edo-era merchant streets',
              costMinor: 0,
              currency: 'JPY'
            }
          ]
        }
      ],
      expenses: [
        {
          id: 'exp-01',
          description: 'Return Flights SFO-HND (Elena & Marcus)',
          amountMinor: 224000, // $2,240.00 USD
          currency: 'USD',
          category: 'TRANSPORT',
          date: '2026-09-15T12:00:00.000Z',
          paidByUserId: 'usr-travel-01',
          exchangeRateToBase: 1.0,
          amountInBaseCurrencyMinor: 224000
        },
        {
          id: 'exp-02',
          description: 'Shinjuku Granbell Lodging (2 nights)',
          amountMinor: 48000, // $480.00 USD
          currency: 'USD',
          category: 'ACCOMMODATION',
          date: '2026-10-10T18:00:00.000Z',
          paidByUserId: 'usr-travel-01',
          exchangeRateToBase: 1.0,
          amountInBaseCurrencyMinor: 48000
        },
        {
          id: 'exp-03',
          description: 'JR Hokuriku Arch Shinkansen Passes (x2)',
          amountMinor: 60000, // 60,000 JPY
          currency: 'JPY',
          category: 'TRANSPORT',
          date: '2026-10-01T09:00:00.000Z',
          paidByUserId: 'usr-travel-02',
          exchangeRateToBase: 0.0067, // JPY to USD
          amountInBaseCurrencyMinor: 40200 // $402.00 USD
        },
        {
          id: 'exp-04',
          description: 'Tokyo Welcome Banquet & Izakaya Feast',
          amountMinor: 15000, // 15,000 JPY
          currency: 'JPY',
          category: 'MEALS',
          date: '2026-10-10T21:00:00.000Z',
          paidByUserId: 'usr-travel-02',
          exchangeRateToBase: 0.0067,
          amountInBaseCurrencyMinor: 10050 // $100.50 USD
        }
      ],
      checklist: [
        { id: 'chk-01', title: 'Verify passport validity (min 6 months)', category: 'Documents', isCompleted: true, assignedToUserId: 'usr-travel-01' },
        { id: 'chk-02', title: 'Submit Visit Japan Web immigration QR code', category: 'Documents', isCompleted: true, assignedToUserId: 'usr-travel-02' },
        { id: 'chk-03', title: 'Reserve Pocket Wi-Fi device pickup', category: 'Electronics', isCompleted: true, assignedToUserId: 'usr-travel-01' },
        { id: 'chk-04', title: 'Pack Type-A two-prong plug travel adapters', category: 'Electronics', isCompleted: false, assignedToUserId: 'usr-travel-02' },
        { id: 'chk-05', title: 'Notify banks of overseas ATM card usage', category: 'Finance', isCompleted: false, assignedToUserId: 'usr-travel-01' },
        { id: 'chk-06', title: 'Thermal layers & hiking shoes for Japanese Alps', category: 'Clothing', isCompleted: false, assignedToUserId: 'usr-travel-03' }
      ]
    }
  ]
};
