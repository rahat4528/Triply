import { WMO_CODE_TABLE, getWeatherCondition } from '../integrations/weather-codes';

describe('WMO Code Table Completeness & Resilience', () => {
  it('contains definitions for all standard WMO categories', () => {
    const requiredCodes = [0, 1, 2, 3, 45, 51, 61, 71, 80, 95];
    requiredCodes.forEach((code) => {
      expect(WMO_CODE_TABLE[code]).toBeDefined();
      expect(WMO_CODE_TABLE[code].description).toBeTruthy();
      expect(WMO_CODE_TABLE[code].dayIcon).toBeTruthy();
      expect(WMO_CODE_TABLE[code].nightIcon).toBeTruthy();
    });
  });

  it('provides safe fallback for unknown weather codes without throwing', () => {
    const unknown = getWeatherCondition(999, true);
    expect(unknown).toBeDefined();
    expect(unknown.code).toBe(999);
    expect(unknown.description).toContain('WMO 999');
    expect(unknown.dayIcon).toBe('cloud');
  });

  it('distinguishes day and night icon recommendations', () => {
    const clearSky = WMO_CODE_TABLE[0];
    expect(clearSky.dayIcon).toBe('sun');
    expect(clearSky.nightIcon).toBe('moon');
  });
});
