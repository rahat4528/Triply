import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Weather Application database with synthetic demo data...');

  // 1. Providers
  await prisma.dataProvider.upsert({
    where: { name: 'open-meteo' },
    update: {},
    create: {
      id: 'prov-open-meteo-01',
      name: 'open-meteo',
      baseUrl: 'https://api.open-meteo.com/v1',
      attribution: 'Weather data by Open-Meteo.com (CC BY 4.0)',
      requiresApiKey: false,
      isActive: true,
      dailyLimit: 10000,
    },
  });

  // 2. Demo User (with bcrypt/sha256 synthetic hash for local development)
  const demoPasswordHash = crypto.createHash('sha256').update('TriplyDemo2026!').digest('hex');
  const user = await prisma.user.upsert({
    where: { email: 'demo@triply.local' },
    update: {},
    create: {
      id: 'user-demo-weather-01',
      email: 'demo@triply.local',
      passwordHash: demoPasswordHash,
      name: 'Demo Meteorologist',
    },
  });

  // 3. User Preferences
  await prisma.weatherPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      temperatureUnit: 'CELSIUS',
      speedUnit: 'KM_H',
      pressureUnit: 'HPA',
      precipitationUnit: 'MM',
      quietHoursStart: 22,
      quietHoursEnd: 7,
    },
  });

  // 4. Saved Favorite Locations
  const locations = [
    {
      name: 'London',
      administrative: 'Greater London, England',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
      elevation: 25.0,
      timezone: 'Europe/London',
      sortOrder: 1,
    },
    {
      name: 'Tokyo',
      administrative: 'Tokyo Prefecture',
      country: 'Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      elevation: 40.0,
      timezone: 'Asia/Tokyo',
      sortOrder: 2,
    },
    {
      name: 'New York',
      administrative: 'New York, NY',
      country: 'United States',
      latitude: 40.7128,
      longitude: -74.0060,
      elevation: 10.0,
      timezone: 'America/New_York',
      sortOrder: 3,
    },
    {
      name: 'Reykjavik',
      administrative: 'Capital Region',
      country: 'Iceland',
      latitude: 64.1466,
      longitude: -21.9426,
      elevation: 15.0,
      timezone: 'Atlantic/Reykjavik',
      sortOrder: 4,
    },
  ];

  for (const loc of locations) {
    await prisma.savedLocation.create({
      data: {
        userId: user.id,
        ...loc,
      },
    });
  }

  // 5. Configured Threshold Alert Rules
  await prisma.weatherAlertRule.create({
    data: {
      userId: user.id,
      locationName: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      metric: 'TEMPERATURE_HIGH',
      comparator: 'GT',
      thresholdValue: 30.0,
      cooldownMinutes: 180,
      isActive: true,
    },
  });

  await prisma.weatherAlertRule.create({
    data: {
      userId: user.id,
      locationName: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      metric: 'RAIN_PROBABILITY',
      comparator: 'GTE',
      thresholdValue: 70.0,
      cooldownMinutes: 120,
      isActive: true,
    },
  });

  // 6. Embeddable Widget Config
  await prisma.widgetConfig.create({
    data: {
      userId: user.id,
      token: 'wgt_tok_sample_london_5150',
      locationName: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      theme: 'auto',
      allowedMetrics: ['temperature', 'condition', 'wind', 'humidity'],
      rateLimitPerHour: 500,
    },
  });

  console.log('Weather Application seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
