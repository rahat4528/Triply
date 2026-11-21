/**
 * Weather Alert Rule Evaluator
 * Evaluates metrics against thresholds with comparator rules, cooldowns, and deduplication.
 * Labeled: "threshold alert based on forecast data"
 */

export interface AlertRule {
  id: string;
  userId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  metric: 'TEMPERATURE_HIGH' | 'TEMPERATURE_LOW' | 'WIND_SPEED' | 'RAIN_PROBABILITY';
  comparator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ';
  thresholdValue: number;
  cooldownMinutes: number;
  lastTriggeredAt?: Date | null;
  isActive: boolean;
}

export interface WeatherDataPoint {
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  precipitationProbability: number;
}

export interface AlertTriggerResult {
  triggered: boolean;
  ruleId: string;
  metric: string;
  triggerValue: number;
  thresholdValue: number;
  message: string;
  reason?: 'IN_COOLDOWN' | 'CRITERIA_NOT_MET' | 'TRIGGERED';
}

export function compareValues(current: number, comparator: AlertRule['comparator'], threshold: number): boolean {
  switch (comparator) {
    case 'GT':
      return current > threshold;
    case 'GTE':
      return current >= threshold;
    case 'LT':
      return current < threshold;
    case 'LTE':
      return current <= threshold;
    case 'EQ':
      return Math.abs(current - threshold) < 0.001;
    default:
      return false;
  }
}

export function evaluateAlertRule(
  rule: AlertRule,
  data: WeatherDataPoint,
  now: Date = new Date()
): AlertTriggerResult {
  if (!rule.isActive) {
    return {
      triggered: false,
      ruleId: rule.id,
      metric: rule.metric,
      triggerValue: 0,
      thresholdValue: rule.thresholdValue,
      message: 'Rule is deactivated.',
      reason: 'CRITERIA_NOT_MET',
    };
  }

  // Check cooldown
  if (rule.lastTriggeredAt) {
    const elapsedMinutes = (now.getTime() - new Date(rule.lastTriggeredAt).getTime()) / (1000 * 60);
    if (elapsedMinutes < rule.cooldownMinutes) {
      return {
        triggered: false,
        ruleId: rule.id,
        metric: rule.metric,
        triggerValue: 0,
        thresholdValue: rule.thresholdValue,
        message: `Alert is in cooldown (${Math.round(rule.cooldownMinutes - elapsedMinutes)} mins remaining).`,
        reason: 'IN_COOLDOWN',
      };
    }
  }

  let valueToTest = 0;
  let metricLabel = '';

  switch (rule.metric) {
    case 'TEMPERATURE_HIGH':
    case 'TEMPERATURE_LOW':
      valueToTest = data.temperature;
      metricLabel = 'Temperature';
      break;
    case 'WIND_SPEED':
      valueToTest = data.windSpeed;
      metricLabel = 'Wind Speed';
      break;
    case 'RAIN_PROBABILITY':
      valueToTest = data.precipitationProbability;
      metricLabel = 'Rain Probability';
      break;
  }

  const isConditionMet = compareValues(valueToTest, rule.comparator, rule.thresholdValue);

  if (isConditionMet) {
    const comparatorSymbols: Record<string, string> = {
      GT: '>',
      GTE: '>=',
      LT: '<',
      LTE: '<=',
      EQ: '=',
    };
    const symbol = comparatorSymbols[rule.comparator] || rule.comparator;

    return {
      triggered: true,
      ruleId: rule.id,
      metric: rule.metric,
      triggerValue: valueToTest,
      thresholdValue: rule.thresholdValue,
      message: `[threshold alert based on forecast data] ${metricLabel} of ${valueToTest} reached configured condition (${symbol} ${rule.thresholdValue}) for ${rule.locationName}.`,
      reason: 'TRIGGERED',
    };
  }

  return {
    triggered: false,
    ruleId: rule.id,
    metric: rule.metric,
    triggerValue: valueToTest,
    thresholdValue: rule.thresholdValue,
    message: 'Threshold condition not met.',
    reason: 'CRITERIA_NOT_MET',
  };
}
