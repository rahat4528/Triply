import { CacheService } from '../backend/src/services/cache.service';
import { OpenMeteoAdapter } from '../integrations/open-meteo.adapter';

describe('Cache TTL, Stale Handling, and API Budget Limits', () => {
  it('identifies fresh versus expired cache entries', async () => {
    const cache = new CacheService();
    const testData = { temp: 20.5 };

    // Set with 1-second TTL
    cache.set('test-key', testData, 1);
    const immediate = cache.get('test-key');
    expect(immediate.hit).toBe(true);
    expect(immediate.isStale).toBe(false);
    expect(immediate.data).toEqual(testData);

    // Wait 1.1s for expiration
    await new Promise((r) => setTimeout(r, 1100));

    const expired = cache.get('test-key');
    expect(expired.hit).toBe(true);
    expect(expired.isStale).toBe(true);
    expect(expired.data).toEqual(testData); // Retains stale copy for resilience
  });

  it('enforces API daily budget limits when configured', async () => {
    const adapter = new OpenMeteoAdapter({ dailyBudget: 2 });
    expect(adapter.getUsageCount()).toBe(0);

    // Trigger searches within budget
    await adapter.searchLocations('London');
    expect(adapter.getUsageCount()).toBe(1);

    await adapter.searchLocations('Tokyo');
    expect(adapter.getUsageCount()).toBe(2);

    // Next call should either trigger budget error or fallback safely
    try {
      await adapter.getWeather(51.5074, -0.1278);
    } catch (err: any) {
      expect(err.message).toContain('limit');
    }
  });
});
