import {
  IWeatherProvider,
  GeocodingResult,
  WeatherDataPayload,
  HistoricalWeatherPayload,
} from './weather-provider.interface';
import { getWeatherCondition } from './weather-codes';
import { validateCoordinates } from './coordinate-validator';
import { FixtureWeatherProvider } from './fixture-provider.adapter';

export class OpenMeteoAdapter implements IWeatherProvider {
  private readonly baseUrl = 'https://api.open-meteo.com/v1';
  private readonly geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';
  private readonly historicalUrl = 'https://archive-api.open-meteo.com/v1';
  private readonly fallbackFixture = new FixtureWeatherProvider();
  private readonly attribution = 'Weather data by Open-Meteo.com (CC BY 4.0)';

  private usageCount = 0;
  private readonly dailyBudget: number;

  constructor(options?: { dailyBudget?: number }) {
    this.dailyBudget = options?.dailyBudget || 10000;
  }

  getUsageCount(): number {
    return this.usageCount;
  }

  private incrementBudget(): void {
    if (this.usageCount >= this.dailyBudget) {
      throw new Error(`API usage limit of ${this.dailyBudget} daily requests reached.`);
    }
    this.usageCount++;
  }

  async searchLocations(query: string): Promise<GeocodingResult[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      this.incrementBudget();
      const url = `${this.geocodingUrl}/search?name=${encodeURIComponent(q)}&count=10&language=en&format=json`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`Geocoding HTTP ${resp.status}`);
      }

      const json: any = await resp.json();
      if (!json.results || !Array.isArray(json.results)) {
        return [];
      }

      return json.results.map((item: any) => ({
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        elevation: item.elevation,
        country: item.country || '',
        countryCode: item.country_code || '',
        admin1: item.admin1 || item.admin2 || '',
        timezone: item.timezone || 'UTC',
      }));
    } catch {
      // Fallback to fixture for reliability when offline
      return this.fallbackFixture.searchLocations(query);
    }
  }

  async getWeather(lat: number, lon: number): Promise<WeatherDataPayload> {
    const coordCheck = validateCoordinates(lat, lon);
    if (!coordCheck.isValid) {
      throw new Error(coordCheck.error);
    }

    try {
      this.incrementBudget();
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'weather_code',
          'surface_pressure',
          'wind_speed_10m',
          'wind_direction_10m',
          'cloud_cover',
        ].join(','),
        hourly: [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'precipitation_probability',
          'precipitation',
          'weather_code',
          'wind_speed_10m',
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'sunrise',
          'sunset',
          'uv_index_max',
          'precipitation_sum',
          'precipitation_probability_max',
          'wind_speed_10m_max',
        ].join(','),
        timezone: 'auto',
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const resp = await fetch(`${this.baseUrl}/forecast?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`Open-Meteo HTTP error ${resp.status}`);
      }

      const data: any = await resp.json();
      const fetchedAt = new Date().toISOString();
      const currentRaw = data.current || {};
      const condition = getWeatherCondition(currentRaw.weather_code ?? 0, currentRaw.is_day === 1);

      const hourlyList = [];
      if (data.hourly && Array.isArray(data.hourly.time)) {
        const count = Math.min(24, data.hourly.time.length);
        for (let i = 0; i < count; i++) {
          hourlyList.push({
            time: data.hourly.time[i],
            temperature: data.hourly.temperature_2m[i] ?? 0,
            feelsLike: data.hourly.apparent_temperature[i] ?? 0,
            precipitationProbability: data.hourly.precipitation_probability[i] ?? 0,
            precipitation: data.hourly.precipitation[i] ?? 0,
            weatherCode: data.hourly.weather_code[i] ?? 0,
            windSpeed: data.hourly.wind_speed_10m[i] ?? 0,
            humidity: data.hourly.relative_humidity_2m[i] ?? 0,
          });
        }
      }

      const dailyList = [];
      if (data.daily && Array.isArray(data.daily.time)) {
        const count = Math.min(7, data.daily.time.length);
        for (let d = 0; d < count; d++) {
          dailyList.push({
            date: data.daily.time[d],
            temperatureMin: data.daily.temperature_2m_min[d] ?? 0,
            temperatureMax: data.daily.temperature_2m_max[d] ?? 0,
            weatherCode: data.daily.weather_code[d] ?? 0,
            precipitationSum: data.daily.precipitation_sum[d] ?? 0,
            precipitationProbabilityMax: data.daily.precipitation_probability_max[d] ?? 0,
            windSpeedMax: data.daily.wind_speed_10m_max[d] ?? 0,
            sunrise: data.daily.sunrise[d] ?? '',
            sunset: data.daily.sunset[d] ?? '',
            uvIndexMax: data.daily.uv_index_max ? data.daily.uv_index_max[d] : undefined,
          });
        }
      }

      return {
        location: {
          id: 0,
          name: `Coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          latitude: lat,
          longitude: lon,
          elevation: data.elevation,
          country: '',
          timezone: data.timezone || 'UTC',
        },
        current: {
          temperature: currentRaw.temperature_2m ?? 0,
          feelsLike: currentRaw.apparent_temperature ?? currentRaw.temperature_2m ?? 0,
          weatherCode: currentRaw.weather_code ?? 0,
          conditionText: condition.description,
          humidity: currentRaw.relative_humidity_2m ?? 0,
          windSpeed: currentRaw.wind_speed_10m ?? 0,
          windDirection: currentRaw.wind_direction_10m ?? 0,
          pressure: currentRaw.surface_pressure ?? 1013,
          uvIndex: data.daily?.uv_index_max?.[0],
          cloudCover: currentRaw.cloud_cover,
          visibility: undefined, // Open-Meteo doesn't always provide visibility without specific opt-in
          isDay: currentRaw.is_day === 1,
          sunrise: data.daily?.sunrise?.[0] || '',
          sunset: data.daily?.sunset?.[0] || '',
          observedAt: currentRaw.time || fetchedAt,
          fetchedAt,
        },
        hourly: hourlyList,
        daily: dailyList,
        dataSource: {
          provider: 'Open-Meteo API',
          attribution: this.attribution,
          isSampleData: false,
          isStale: false,
          fetchedAt,
        },
      };
    } catch {
      // Return fallback fixture with clear indicator
      const fallback = await this.fallbackFixture.getWeather(lat, lon);
      fallback.dataSource.staleReason = 'Upstream provider unavailable; using deterministic local fallback.';
      return fallback;
    }
  }

  async getHistoricalWeather(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
  ): Promise<HistoricalWeatherPayload> {
    const coordCheck = validateCoordinates(lat, lon);
    if (!coordCheck.isValid) {
      throw new Error(coordCheck.error);
    }

    try {
      this.incrementBudget();
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        start_date: startDate,
        end_date: endDate,
        daily: ['temperature_2m_mean', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'wind_speed_10m_max'].join(','),
        timezone: 'auto',
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const resp = await fetch(`${this.historicalUrl}/archive?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) {
        throw new Error(`Open-Meteo Archive HTTP error ${resp.status}`);
      }

      const data: any = await resp.json();
      const dailyList = [];
      if (data.daily && Array.isArray(data.daily.time)) {
        for (let i = 0; i < data.daily.time.length; i++) {
          dailyList.push({
            date: data.daily.time[i],
            temperatureMean: data.daily.temperature_2m_mean[i] ?? 0,
            temperatureMax: data.daily.temperature_2m_max[i] ?? 0,
            temperatureMin: data.daily.temperature_2m_min[i] ?? 0,
            precipitationSum: data.daily.precipitation_sum[i] ?? 0,
            windSpeedMax: data.daily.wind_speed_10m_max[i] ?? 0,
          });
        }
      }

      return {
        location: {
          id: 0,
          name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          latitude: lat,
          longitude: lon,
          country: '',
          timezone: data.timezone || 'UTC',
        },
        dataType: 'REANALYSIS_ARCHIVE',
        startDate,
        endDate,
        daily: dailyList,
        attribution: 'ERA5 Reanalysis Archive Data from Open-Meteo.com (CC BY 4.0)',
      };
    } catch {
      return this.fallbackFixture.getHistoricalWeather(lat, lon, startDate, endDate);
    }
  }
}
