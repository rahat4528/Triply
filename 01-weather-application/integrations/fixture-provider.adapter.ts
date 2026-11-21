import {
  IWeatherProvider,
  GeocodingResult,
  WeatherDataPayload,
  HistoricalWeatherPayload,
} from './weather-provider.interface';
import { getWeatherCondition } from './weather-codes';

export class FixtureWeatherProvider implements IWeatherProvider {
  private readonly defaultLocation: GeocodingResult = {
    id: 2643743,
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    elevation: 25.0,
    country: 'United Kingdom',
    countryCode: 'GB',
    admin1: 'England',
    timezone: 'Europe/London',
  };

  async searchLocations(query: string): Promise<GeocodingResult[]> {
    const q = query.trim().toLowerCase();
    const fixtures: GeocodingResult[] = [
      {
        id: 2643743,
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
        elevation: 25.0,
        country: 'United Kingdom',
        countryCode: 'GB',
        admin1: 'Greater London',
        timezone: 'Europe/London',
      },
      {
        id: 6058560,
        name: 'London',
        latitude: 42.9834,
        longitude: -81.233,
        elevation: 251.0,
        country: 'Canada',
        countryCode: 'CA',
        admin1: 'Ontario',
        timezone: 'America/Toronto',
      },
      {
        id: 1850147,
        name: 'Tokyo',
        latitude: 35.6762,
        longitude: 139.6503,
        elevation: 40.0,
        country: 'Japan',
        countryCode: 'JP',
        admin1: 'Tokyo Prefecture',
        timezone: 'Asia/Tokyo',
      },
      {
        id: 5128581,
        name: 'New York',
        latitude: 40.7128,
        longitude: -74.006,
        elevation: 10.0,
        country: 'United States',
        countryCode: 'US',
        admin1: 'New York',
        timezone: 'America/New_York',
      },
    ];

    if (!q) return fixtures;
    return fixtures.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        (loc.admin1 && loc.admin1.toLowerCase().includes(q)) ||
        loc.country.toLowerCase().includes(q)
    );
  }

  async getWeather(lat: number, lon: number): Promise<WeatherDataPayload> {
    const now = new Date();
    const observedAt = new Date(now.getTime() - 12 * 60 * 1000).toISOString();
    const fetchedAt = now.toISOString();

    const hourly = [];
    for (let i = 0; i < 24; i++) {
      const forecastTime = new Date(now.getTime() + i * 3600 * 1000).toISOString();
      const tempVariation = Math.sin((i / 24) * Math.PI * 2) * 5;
      hourly.push({
        time: forecastTime,
        temperature: Math.round((14 + tempVariation) * 10) / 10,
        feelsLike: Math.round((13.5 + tempVariation) * 10) / 10,
        precipitationProbability: Math.min(100, Math.max(0, Math.round(15 + i * 2))),
        precipitation: i === 6 || i === 7 ? 0.8 : 0,
        weatherCode: i === 6 || i === 7 ? 61 : 2,
        windSpeed: 14.5 + (i % 5),
        humidity: 68 + (i % 10),
      });
    }

    const daily = [];
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(now.getTime() + d * 86400 * 1000);
      const dateStr = dayDate.toISOString().split('T')[0];
      daily.push({
        date: dateStr,
        temperatureMin: 8 + d,
        temperatureMax: 18 + (d % 3),
        weatherCode: d % 3 === 0 ? 61 : 1,
        precipitationSum: d % 3 === 0 ? 3.5 : 0.0,
        precipitationProbabilityMax: d % 3 === 0 ? 75 : 10,
        windSpeedMax: 22.0,
        sunrise: `${dateStr}T06:15:00Z`,
        sunset: `${dateStr}T19:45:00Z`,
        uvIndexMax: 4.8,
      });
    }

    return {
      location: {
        ...this.defaultLocation,
        latitude: lat,
        longitude: lon,
      },
      current: {
        temperature: 15.2,
        feelsLike: 14.6,
        weatherCode: 2,
        conditionText: getWeatherCondition(2, true).description,
        humidity: 65,
        windSpeed: 16.2,
        windDirection: 210,
        pressure: 1013.2,
        uvIndex: 3.5,
        cloudCover: 40,
        visibility: 10000,
        isDay: true,
        sunrise: new Date(now.setHours(6, 15, 0, 0)).toISOString(),
        sunset: new Date(now.setHours(19, 45, 0, 0)).toISOString(),
        observedAt,
        fetchedAt,
      },
      hourly,
      daily,
      dataSource: {
        provider: 'Deterministic Fixture Provider',
        attribution: 'Weather data generated deterministically for testing and local development (Sample data)',
        isSampleData: true,
        isStale: false,
        fetchedAt,
      },
    };
  }

  async getHistoricalWeather(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
  ): Promise<HistoricalWeatherPayload> {
    const daily = [
      {
        date: startDate,
        temperatureMean: 13.5,
        temperatureMax: 17.2,
        temperatureMin: 9.8,
        precipitationSum: 1.2,
        windSpeedMax: 18.5,
      },
      {
        date: endDate,
        temperatureMean: 14.1,
        temperatureMax: 18.0,
        temperatureMin: 10.2,
        precipitationSum: 0.0,
        windSpeedMax: 14.2,
      },
    ];

    return {
      location: {
        ...this.defaultLocation,
        latitude: lat,
        longitude: lon,
      },
      dataType: 'REANALYSIS_ARCHIVE',
      startDate,
      endDate,
      daily,
      attribution: 'Sample Reanalysis Archive Data (historical data, not real-time station observation)',
    };
  }
}
