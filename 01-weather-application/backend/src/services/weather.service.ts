import { IWeatherProvider, WeatherDataPayload, GeocodingResult, HistoricalWeatherPayload } from '../../../integrations/weather-provider.interface';
import { OpenMeteoAdapter } from '../../../integrations/open-meteo.adapter';
import { FixtureWeatherProvider } from '../../../integrations/fixture-provider.adapter';
import { validateCoordinates } from '../../../integrations/coordinate-validator';
import { globalCache } from './cache.service';

export class WeatherService {
  private provider: IWeatherProvider;
  private isFixtureFallback: boolean;

  constructor(forceFixture = false) {
    if (forceFixture || process.env.WEATHER_PROVIDER === 'fixture') {
      this.provider = new FixtureWeatherProvider();
      this.isFixtureFallback = true;
    } else {
      this.provider = new OpenMeteoAdapter({
        dailyBudget: parseInt(process.env.WEATHER_API_BUDGET_DAILY || '10000', 10),
      });
      this.isFixtureFallback = false;
    }
  }

  async searchLocations(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const cacheKey = `geo:${query.trim().toLowerCase()}`;
    const cached = globalCache.get<GeocodingResult[]>(cacheKey);
    if (cached.hit && cached.data) {
      return cached.data;
    }

    const results = await this.provider.searchLocations(query);
    // Cache geocoding for 24 hours
    globalCache.set(cacheKey, results, 86400);
    return results;
  }

  async getWeather(lat: number, lon: number): Promise<WeatherDataPayload> {
    const coordValidation = validateCoordinates(lat, lon);
    if (!coordValidation.isValid) {
      throw new Error(coordValidation.error);
    }

    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLon = Math.round(lon * 100) / 100;
    const cacheKey = `weather:${roundedLat}:${roundedLon}`;

    const cached = globalCache.get<WeatherDataPayload>(cacheKey);
    const ttlSeconds = parseInt(process.env.WEATHER_CACHE_TTL_SECONDS || '900', 10);

    // If cache is fresh, return directly
    if (cached.hit && cached.data && !cached.isStale) {
      return cached.data;
    }

    try {
      const liveData = await this.provider.getWeather(lat, lon);
      globalCache.set(cacheKey, liveData, ttlSeconds, liveData.current.observedAt);
      return liveData;
    } catch (err: any) {
      // If live call fails but we have cached data (even stale), return it labeled stale
      if (cached.hit && cached.data) {
        return {
          ...cached.data,
          dataSource: {
            ...cached.data.dataSource,
            isStale: true,
            staleReason: `Upstream error (${err.message || 'Network failure'}). Displaying last cached data.`,
          },
        };
      }
      throw err;
    }
  }

  async getHistoricalWeather(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
  ): Promise<HistoricalWeatherPayload> {
    const coordValidation = validateCoordinates(lat, lon);
    if (!coordValidation.isValid) {
      throw new Error(coordValidation.error);
    }

    const cacheKey = `historical:${lat.toFixed(2)}:${lon.toFixed(2)}:${startDate}:${endDate}`;
    const cached = globalCache.get<HistoricalWeatherPayload>(cacheKey);
    if (cached.hit && cached.data) {
      return cached.data;
    }

    const data = await this.provider.getHistoricalWeather(lat, lon, startDate, endDate);
    globalCache.set(cacheKey, data, 86400 * 7); // Cache reanalysis archive for 7 days
    return data;
  }

  async compareLocations(coords: { lat: number; lon: number; name?: string }[]): Promise<WeatherDataPayload[]> {
    const promises = coords.slice(0, 4).map(async (c) => {
      const data = await this.getWeather(c.lat, c.lon);
      if (c.name) {
        data.location.name = c.name;
      }
      return data;
    });

    return Promise.all(promises);
  }
}

export const globalWeatherService = new WeatherService();
