/**
 * Canonical Unit Conversions with Exact Arithmetic & Round-trip Precision
 * Canonical Storage:
 * - Temperature: Celsius (°C)
 * - Wind Speed: Kilometers per hour (km/h)
 * - Pressure: Hectopascals (hPa)
 * - Precipitation: Millimeters (mm)
 */

export type TemperatureUnit = 'CELSIUS' | 'FAHRENHEIT';
export type SpeedUnit = 'KM_H' | 'M_S' | 'MPH' | 'KNOTS';
export type PressureUnit = 'HPA' | 'INHG' | 'MMHG';
export type PrecipitationUnit = 'MM' | 'INCH';

// ------------------- Temperature -------------------
export function celsiusToFahrenheit(c: number): number {
  return Math.round(((c * 9) / 5 + 32) * 100) / 100;
}

export function fahrenheitToCelsius(f: number): number {
  return Math.round((((f - 32) * 5) / 9) * 100) / 100;
}

export function convertTemperature(celsius: number, target: TemperatureUnit): number {
  if (target === 'FAHRENHEIT') {
    return celsiusToFahrenheit(celsius);
  }
  return Math.round(celsius * 100) / 100;
}

// ------------------- Speed -------------------
// Canonical: km/h
export function kmhToMs(kmh: number): number {
  return Math.round((kmh / 3.6) * 100) / 100;
}

export function msToKmh(ms: number): number {
  return Math.round(ms * 3.6 * 100) / 100;
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.62137119 * 100) / 100;
}

export function mphToKmh(mph: number): number {
  return Math.round((mph / 0.62137119) * 100) / 100;
}

export function kmhToKnots(kmh: number): number {
  return Math.round(kmh * 0.5399568 * 100) / 100;
}

export function knotsToKmh(knots: number): number {
  return Math.round((knots / 0.5399568) * 100) / 100;
}

export function convertSpeed(kmh: number, target: SpeedUnit): number {
  switch (target) {
    case 'M_S':
      return kmhToMs(kmh);
    case 'MPH':
      return kmhToMph(kmh);
    case 'KNOTS':
      return kmhToKnots(kmh);
    case 'KM_H':
    default:
      return Math.round(kmh * 100) / 100;
  }
}

// ------------------- Pressure -------------------
// Canonical: hPa (1 hPa = 1 mbar)
export function hpaToInHg(hpa: number): number {
  return Math.round(hpa * 0.02952998 * 100) / 100;
}

export function inHgToHpa(inHg: number): number {
  return Math.round((inHg / 0.02952998) * 100) / 100;
}

export function hpaToMmHg(hpa: number): number {
  return Math.round(hpa * 0.75006156 * 100) / 100;
}

export function mmHgToHpa(mmHg: number): number {
  return Math.round((mmHg / 0.75006156) * 100) / 100;
}

export function convertPressure(hpa: number, target: PressureUnit): number {
  switch (target) {
    case 'INHG':
      return hpaToInHg(hpa);
    case 'MMHG':
      return hpaToMmHg(hpa);
    case 'HPA':
    default:
      return Math.round(hpa * 100) / 100;
  }
}

// ------------------- Precipitation -------------------
// Canonical: mm
export function mmToInch(mm: number): number {
  return Math.round(mm * 0.0393700787 * 100) / 100;
}

export function inchToMm(inch: number): number {
  return Math.round((inch / 0.0393700787) * 100) / 100;
}

export function convertPrecipitation(mm: number, target: PrecipitationUnit): number {
  if (target === 'INCH') {
    return mmToInch(mm);
  }
  return Math.round(mm * 100) / 100;
}
