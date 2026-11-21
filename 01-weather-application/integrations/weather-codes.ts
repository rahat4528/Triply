/**
 * Comprehensive WMO (World Meteorological Organization) Code Mappings
 * Maps WMO code (0-99) to human-readable condition description, icon slug, and severity.
 */

export interface WeatherConditionInfo {
  code: number;
  description: string;
  dayIcon: string;
  nightIcon: string;
  category: 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
}

export const WMO_CODE_TABLE: Record<number, WeatherConditionInfo> = {
  0: { code: 0, description: 'Clear sky', dayIcon: 'sun', nightIcon: 'moon', category: 'clear' },
  1: { code: 1, description: 'Mainly clear', dayIcon: 'sun-cloud', nightIcon: 'moon-cloud', category: 'clear' },
  2: { code: 2, description: 'Partly cloudy', dayIcon: 'cloud-sun', nightIcon: 'cloud-moon', category: 'cloudy' },
  3: { code: 3, description: 'Overcast', dayIcon: 'cloud', nightIcon: 'cloud', category: 'cloudy' },
  45: { code: 45, description: 'Fog', dayIcon: 'cloud-fog', nightIcon: 'cloud-fog', category: 'fog' },
  48: { code: 48, description: 'Depositing rime fog', dayIcon: 'cloud-fog', nightIcon: 'cloud-fog', category: 'fog' },
  51: { code: 51, description: 'Light drizzle', dayIcon: 'cloud-drizzle', nightIcon: 'cloud-drizzle', category: 'drizzle' },
  53: { code: 53, description: 'Moderate drizzle', dayIcon: 'cloud-drizzle', nightIcon: 'cloud-drizzle', category: 'drizzle' },
  55: { code: 55, description: 'Dense intensity drizzle', dayIcon: 'cloud-drizzle', nightIcon: 'cloud-drizzle', category: 'drizzle' },
  56: { code: 56, description: 'Light freezing drizzle', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'drizzle' },
  57: { code: 57, description: 'Dense freezing drizzle', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'drizzle' },
  61: { code: 61, description: 'Slight rain', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain', category: 'rain' },
  62: { code: 62, description: 'Moderate rain', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain', category: 'rain' },
  63: { code: 63, description: 'Heavy rain', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain', category: 'rain' },
  65: { code: 65, description: 'Heavy intensity rain', dayIcon: 'cloud-rain', nightIcon: 'cloud-rain', category: 'rain' },
  66: { code: 66, description: 'Light freezing rain', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'rain' },
  67: { code: 67, description: 'Heavy freezing rain', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'rain' },
  71: { code: 71, description: 'Slight snow fall', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'snow' },
  73: { code: 73, description: 'Moderate snow fall', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'snow' },
  75: { code: 75, description: 'Heavy snow fall', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'snow' },
  77: { code: 77, description: 'Snow grains', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'snow' },
  80: { code: 80, description: 'Slight rain showers', dayIcon: 'cloud-sun-rain', nightIcon: 'cloud-moon-rain', category: 'rain' },
  81: { code: 81, description: 'Moderate rain showers', dayIcon: 'cloud-sun-rain', nightIcon: 'cloud-moon-rain', category: 'rain' },
  82: { code: 82, description: 'Violent rain showers', dayIcon: 'cloud-rain-wind', nightIcon: 'cloud-rain-wind', category: 'rain' },
  85: { code: 85, description: 'Slight snow showers', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'snow' },
  86: { code: 86, description: 'Heavy snow showers', dayIcon: 'cloud-snow', nightIcon: 'cloud-snow', category: 'snow' },
  95: { code: 95, description: 'Thunderstorm', dayIcon: 'cloud-lightning', nightIcon: 'cloud-lightning', category: 'thunderstorm' },
  96: { code: 96, description: 'Thunderstorm with slight hail', dayIcon: 'cloud-lightning', nightIcon: 'cloud-lightning', category: 'thunderstorm' },
  99: { code: 99, description: 'Thunderstorm with heavy hail', dayIcon: 'cloud-lightning', nightIcon: 'cloud-lightning', category: 'thunderstorm' },
};

export function getWeatherCondition(code: number, isDay = true): WeatherConditionInfo {
  const match = WMO_CODE_TABLE[code];
  if (match) {
    return match;
  }
  // Safe fallback for unlisted WMO code
  return {
    code,
    description: `Atmospheric event (WMO ${code})`,
    dayIcon: isDay ? 'cloud' : 'cloud-moon',
    nightIcon: 'cloud-moon',
    category: 'cloudy',
  };
}
