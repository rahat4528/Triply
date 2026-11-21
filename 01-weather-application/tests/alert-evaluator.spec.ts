import { evaluateAlertRule, AlertRule } from '../integrations/alert-evaluator';

describe('Weather Alert Rule Evaluation Engine', () => {
  const baseRule: AlertRule = {
    id: 'rule-test-01',
    userId: 'user-01',
    locationName: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    metric: 'TEMPERATURE_HIGH',
    comparator: 'GT',
    thresholdValue: 30.0,
    cooldownMinutes: 120,
    lastTriggeredAt: null,
    isActive: true,
  };

  it('triggers alert when condition is met and labels as threshold alert', () => {
    const res = evaluateAlertRule(baseRule, {
      temperature: 32.5,
      feelsLike: 34.0,
      windSpeed: 15,
      precipitationProbability: 10,
    });

    expect(res.triggered).toBe(true);
    expect(res.reason).toBe('TRIGGERED');
    expect(res.message).toContain('[threshold alert based on forecast data]');
    expect(res.message).toContain('Temperature of 32.5 reached configured condition (> 30)');
  });

  it('does not trigger when condition is not met', () => {
    const res = evaluateAlertRule(baseRule, {
      temperature: 25.0,
      feelsLike: 25.0,
      windSpeed: 10,
      precipitationProbability: 0,
    });

    expect(res.triggered).toBe(false);
    expect(res.reason).toBe('CRITERIA_NOT_MET');
  });

  it('enforces cooldown period and prevents rapid re-triggering', () => {
    const now = new Date();
    const recentlyTriggered: AlertRule = {
      ...baseRule,
      lastTriggeredAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago, cooldown is 120 mins
    };

    const res = evaluateAlertRule(
      recentlyTriggered,
      {
        temperature: 35.0,
        feelsLike: 36.0,
        windSpeed: 20,
        precipitationProbability: 5,
      },
      now
    );

    expect(res.triggered).toBe(false);
    expect(res.reason).toBe('IN_COOLDOWN');
    expect(res.message).toContain('Alert is in cooldown');
  });

  it('re-arms after cooldown expires', () => {
    const now = new Date();
    const expiredCooldown: AlertRule = {
      ...baseRule,
      lastTriggeredAt: new Date(now.getTime() - 150 * 60 * 1000), // 150 mins ago, cooldown was 120
    };

    const res = evaluateAlertRule(
      expiredCooldown,
      {
        temperature: 31.0,
        feelsLike: 32.0,
        windSpeed: 10,
        precipitationProbability: 0,
      },
      now
    );

    expect(res.triggered).toBe(true);
    expect(res.reason).toBe('TRIGGERED');
  });
});
