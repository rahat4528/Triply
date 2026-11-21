import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  kmhToMs,
  msToKmh,
  kmhToMph,
  mphToKmh,
  kmhToKnots,
  knotsToKmh,
  hpaToInHg,
  inHgToHpa,
  hpaToMmHg,
  mmHgToHpa,
  mmToInch,
  inchToMm,
} from '../integrations/units';

describe('Unit Conversion Round Trips & Accuracy', () => {
  describe('Temperature (°C <-> °F)', () => {
    it('converts boiling and freezing points accurately', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
      expect(celsiusToFahrenheit(100)).toBe(212);
      expect(fahrenheitToCelsius(32)).toBe(0);
      expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it('performs round-trip conversions without drift', () => {
      const testTemps = [-40, -15.5, 0, 18.25, 36.6, 50];
      testTemps.forEach((c) => {
        const f = celsiusToFahrenheit(c);
        const backToC = fahrenheitToCelsius(f);
        expect(Math.abs(backToC - c)).toBeLessThanOrEqual(0.02);
      });
    });
  });

  describe('Wind Speed (km/h <-> m/s, mph, knots)', () => {
    it('converts km/h to m/s and back', () => {
      expect(kmhToMs(36)).toBe(10);
      expect(msToKmh(10)).toBe(36);
    });

    it('converts km/h to mph and back', () => {
      const kmh = 100;
      const mph = kmhToMph(kmh);
      expect(mph).toBeCloseTo(62.14, 1);
      expect(mphToKmh(mph)).toBeCloseTo(kmh, 1);
    });

    it('converts km/h to knots and back', () => {
      const kmh = 50;
      const knots = kmhToKnots(kmh);
      expect(knots).toBeCloseTo(27.0, 1);
      expect(knotsToKmh(knots)).toBeCloseTo(kmh, 1);
    });
  });

  describe('Atmospheric Pressure (hPa <-> inHg, mmHg)', () => {
    it('converts standard sea level pressure 1013.25 hPa', () => {
      const hpa = 1013.25;
      const inHg = hpaToInHg(hpa);
      expect(inHg).toBeCloseTo(29.92, 1);
      expect(inHgToHpa(inHg)).toBeCloseTo(hpa, 0);

      const mmHg = hpaToMmHg(hpa);
      expect(mmHg).toBeCloseTo(760, 0);
      expect(mmHgToHpa(mmHg)).toBeCloseTo(hpa, 0);
    });
  });

  describe('Precipitation (mm <-> inch)', () => {
    it('converts 25.4 mm to 1.0 inch', () => {
      expect(mmToInch(25.4)).toBe(1);
      expect(inchToMm(1)).toBe(25.4);
    });
  });
});
