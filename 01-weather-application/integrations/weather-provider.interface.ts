/**
 * Standard Weather Provider Interface
 */

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country: string;
  countryCode?: string;
  admin1?: string; // Administrative area (State / Province / County)
  timezone: string;
}

export interface CurrentConditions {
  temperature: number; // Canonical °C
  feelsLike: number;   // Canonical °C
  weatherCode: number;
  conditionText: string;
  humidity: number;    // %
  windSpeed: number;   // Canonical km/h
  windDirection: number; // degrees
  pressure: number;    // Canonical hPa
  uvIndex?: number;
  cloudCover?: number; // %
  visibility?: number; // meters (or undefined if unavailable)
  isDay: boolean;
  sunrise: string;     // ISO UTC
  sunset: string;      // ISO UTC
  observedAt: string;  // ISO UTC
  fetchedAt: string;   // ISO UTC
}

export interface HourlyForecastItem {
  time: string;        // ISO UTC
  temperature: number; // Canonical °C
  feelsLike: number;
  precipitationProbability: number; // %
  precipitation: number;            // Canonical mm
  weatherCode: number;
  windSpeed: number;                // Canonical km/h
  humidity: number;
}

export interface DailyForecastItem {
  date: string;        // YYYY-MM-DD
  temperatureMin: number;
  temperatureMax: number;
  weatherCode: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
  uvIndexMax?: number;
}

export interface WeatherDataPayload {
  location: GeocodingResult;
  current: CurrentConditions;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  dataSource: {
    provider: string;
    attribution: string;
    isSampleData: boolean;
    isStale: boolean;
    staleReason?: string;
    fetchedAt: string;
  };
}

export interface HistoricalWeatherPayload {
  location: GeocodingResult;
  dataType: 'REANALYSIS_ARCHIVE'; // Strictly designated
  startDate: string;
  endDate: string;
  daily: {
    date: string;
    temperatureMean: number;
    temperatureMax: number;
    temperatureMin: number;
    precipitationSum: number;
    windSpeedMax: number;
  }[];
  attribution: string;
}

export interface IWeatherProvider {
  searchLocations(query: string): Promise<GeocodingResult[]>;
  getWeather(lat: number, lon: number): Promise<WeatherDataPayload>;
  getHistoricalWeather(lat: number, lon: number, startDate: string, endDate: string): Promise<HistoricalWeatherPayload>;
}
