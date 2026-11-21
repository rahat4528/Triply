import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Location-Based Service with realistic synthetic geospatial datasets (Sample data)...');

  // 1. Categories
  const categories = [
    { id: 'cat-health', name: 'Healthcare', slug: 'healthcare', icon: 'cross', description: 'Hospitals, clinics, and pharmacies' },
    { id: 'cat-dining', name: 'Dining & Cafes', slug: 'dining', icon: 'utensils', description: 'Restaurants, bistros, and coffee houses' },
    { id: 'cat-transit', name: 'Public Transit', slug: 'transit', icon: 'train', description: 'Metro, bus stations, and rail hubs' },
    { id: 'cat-fuel', name: 'Fuel & EV Charging', slug: 'fuel-ev', icon: 'zap', description: 'Petrol stations and rapid EV charging points' },
    { id: 'cat-parks', name: 'Parks & Recreation', slug: 'parks', icon: 'trees', description: 'Public gardens, recreation grounds, and waterfronts' },
  ];

  for (const cat of categories) {
    await prisma.placeCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 2. Demo User
  const passHash = crypto.createHash('sha256').update('TriplyLocation2026!').digest('hex');
  const user = await prisma.user.upsert({
    where: { email: 'traveler@triply.local' },
    update: {},
    create: {
      id: 'usr-loc-demo-01',
      email: 'traveler@triply.local',
      passwordHash: passHash,
      name: 'Geospatial Navigator',
      role: 'USER',
    },
  });

  // 3. User Preferences
  await prisma.userLocationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      defaultRadiusMeters: 5000,
      distanceUnit: 'METERS',
      historyEnabled: true,
      retentionDays: 30,
      quietHoursStart: 23,
      quietHoursEnd: 7,
    },
  });

  // 4. Initial Recorded Consents (LocationPermissionRecord)
  await prisma.locationPermissionRecord.create({
    data: {
      userId: user.id,
      purpose: 'NEARBY_SEARCH',
      permissionState: 'GRANTED',
    },
  });

  await prisma.locationPermissionRecord.create({
    data: {
      userId: user.id,
      purpose: 'GEOFENCING',
      permissionState: 'GRANTED',
    },
  });

  // 5. Seed Places (Central London coordinates for demo)
  const places = [
    {
      categoryId: 'cat-health',
      name: 'St Thomas Hospital',
      description: 'Major NHS teaching hospital on the South Bank',
      address: 'Westminster Bridge Rd, London SE1 7EH',
      latitude: 51.5002,
      longitude: -0.1194,
      isOpenNow: true,
      openingHours: '24/7 Emergency & Inpatient',
      phone: '+44 20 7188 7188',
      isVerified: true,
      isSampleData: true,
    },
    {
      categoryId: 'cat-dining',
      name: 'Borough Market Artisans',
      description: 'Historic vibrant food market with fresh delicacies',
      address: '8 Southwark St, London SE1 1TL',
      latitude: 51.5055,
      longitude: -0.0910,
      isOpenNow: true,
      openingHours: '10:00 - 17:00 Tue-Sun',
      website: 'https://boroughmarket.org.uk',
      isVerified: true,
      isSampleData: true,
    },
    {
      categoryId: 'cat-transit',
      name: 'Waterloo Station',
      description: 'Central London railway terminus and Underground interchange',
      address: 'Waterloo Rd, London SE1 8SW',
      latitude: 51.5032,
      longitude: -0.1123,
      isOpenNow: true,
      openingHours: '04:30 - 01:00 Daily',
      isVerified: true,
      isSampleData: true,
    },
    {
      categoryId: 'cat-fuel',
      name: 'Shell Recharge Hub Southwark',
      description: '150kW ultra-rapid EV charging station',
      address: 'Blackfriars Rd, London SE1 8HW',
      latitude: 51.5048,
      longitude: -0.1035,
      isOpenNow: true,
      openingHours: '24/7 EV Access',
      isVerified: true,
      isSampleData: true,
    },
    {
      categoryId: 'cat-parks',
      name: 'Jubilee Gardens',
      description: 'Riverside public park adjacent to the London Eye',
      address: 'Belvedere Rd, London SE1 7PG',
      latitude: 51.5036,
      longitude: -0.1189,
      isOpenNow: true,
      openingHours: 'Open Access 24 Hours',
      isVerified: true,
      isSampleData: true,
    },
  ];

  for (const p of places) {
    await prisma.place.create({ data: p });
  }

  // 6. Geofence demo
  await prisma.geofence.create({
    data: {
      userId: user.id,
      name: 'South Bank Cultural District',
      type: 'CIRCLE',
      latitude: 51.5045,
      longitude: -0.1145,
      radiusMeters: 800,
      dwellMinutes: 1,
      isActive: true,
    },
  });

  console.log('Location-Based Service seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
