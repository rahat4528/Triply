import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Map Visualization Tool with synthetic geospatial datasets (Sample data)...');

  // 1. Demo User
  const passHash = crypto.createHash('sha256').update('TriplyMapViz2026!').digest('hex');
  const user = await prisma.user.upsert({
    where: { email: 'analyst@triply.local' },
    update: {},
    create: {
      id: 'usr-map-demo-01',
      email: 'analyst@triply.local',
      passwordHash: passHash,
      name: 'Geospatial Intelligence Analyst',
    },
  });

  // 2. Synthetic Dataset 1: Air Quality Telemetry Points (CSV)
  const airQualityDataset = await prisma.dataset.create({
    data: {
      id: 'ds-air-quality-london',
      userId: user.id,
      name: 'London Air Quality Sensor Network',
      description: 'Continuous atmospheric particulate and NO2 observations across London boroughs',
      sourceFormat: 'CSV',
      rowCount: 5,
      bounds: [-0.15, 51.48, -0.08, 51.52],
      isSampleData: true,
    },
  });

  // Columns for Dataset 1
  const columns = [
    { name: 'station_id', inferredType: 'STRING', isGeometry: false, sampleValues: ['AQ-01', 'AQ-02'] },
    { name: 'station_name', inferredType: 'STRING', isGeometry: false, sampleValues: ['Westminster Bridge', 'Borough High St'] },
    { name: 'latitude', inferredType: 'FLOAT', isGeometry: true, sampleValues: ['51.5002', '51.5055'] },
    { name: 'longitude', inferredType: 'FLOAT', isGeometry: true, sampleValues: ['-0.1194', '-0.0910'] },
    { name: 'pm25_ug_m3', inferredType: 'FLOAT', isGeometry: false, sampleValues: ['14.2', '28.5'] },
    { name: 'no2_ppb', inferredType: 'FLOAT', isGeometry: false, sampleValues: ['32.1', '45.0'] },
    { name: 'aqi_category', inferredType: 'STRING', isGeometry: false, sampleValues: ['Moderate', 'Unhealthy for Sensitive Groups'] },
  ];

  for (const col of columns) {
    await prisma.datasetColumn.create({
      data: {
        datasetId: airQualityDataset.id,
        ...col,
      },
    });
  }

  // Sample Features
  const features = [
    { lat: 51.5002, lon: -0.1194, name: 'Westminster Station', pm25: 14.2, no2: 32.1, aqi: 'Moderate' },
    { lat: 51.5055, lon: -0.0910, name: 'Borough High St', pm25: 28.5, no2: 45.0, aqi: 'Unhealthy' },
    { lat: 51.5032, lon: -0.1123, name: 'Waterloo Hub', pm25: 19.8, no2: 38.4, aqi: 'Moderate' },
    { lat: 51.5048, lon: -0.1035, name: 'Southwark Bridge Rd', pm25: 22.1, no2: 41.2, aqi: 'Unhealthy' },
    { lat: 51.5036, lon: -0.1189, name: 'Jubilee Riverfront', pm25: 9.4, no2: 18.6, aqi: 'Good' },
  ];

  for (const f of features) {
    await prisma.geographicFeature.create({
      data: {
        datasetId: airQualityDataset.id,
        latitude: f.lat,
        longitude: f.lon,
        geometryType: 'Point',
        properties: {
          station_name: f.name,
          pm25_ug_m3: f.pm25,
          no2_ppb: f.no2,
          aqi_category: f.aqi,
        },
      },
    });
  }

  // 3. Map Project
  const project = await prisma.mapProject.create({
    data: {
      id: 'proj-london-air-quality',
      userId: user.id,
      title: 'London Environmental Particulate Analysis',
      description: 'Spatial density and particulate exposure analysis across South Bank',
      centerLat: 51.5045,
      centerLon: -0.1145,
      zoom: 13.0,
      pitch: 30.0,
      bearing: 15.0,
      basemapStyle: 'dark',
    },
  });

  // Layer 1: Point Layer
  await prisma.mapLayer.create({
    data: {
      projectId: project.id,
      datasetId: airQualityDataset.id,
      name: 'Air Quality Sensors (Points)',
      type: 'POINT',
      isVisible: true,
      sortOrder: 1,
      config: {
        colorScale: 'viridis',
        colorField: 'pm25_ug_m3',
        radiusField: 'pm25_ug_m3',
        radiusScale: 2.5,
        opacity: 0.85,
      },
    },
  });

  // Layer 2: Heatmap Layer
  await prisma.mapLayer.create({
    data: {
      projectId: project.id,
      datasetId: airQualityDataset.id,
      name: 'NO2 Concentration Density (Heatmap)',
      type: 'HEATMAP',
      isVisible: true,
      sortOrder: 2,
      config: {
        weightField: 'no2_ppb',
        radiusPixels: 40,
        intensity: 1.2,
        opacity: 0.65,
      },
    },
  });

  console.log('Map Visualization Tool seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
