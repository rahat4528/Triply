import { Router, Request, Response } from 'express';
import { AlertRule, evaluateAlertRule } from '../../../integrations/alert-evaluator';
import { globalNotificationService } from '../services/notification.service';
import { globalWeatherService } from '../services/weather.service';

export const alertsRouter = Router();

let alertRules: AlertRule[] = [
  {
    id: 'rule-london-temp-high',
    userId: 'user-demo-01',
    locationName: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    metric: 'TEMPERATURE_HIGH',
    comparator: 'GT',
    thresholdValue: 28.0,
    cooldownMinutes: 180,
    isActive: true,
  },
  {
    id: 'rule-london-rain',
    userId: 'user-demo-01',
    locationName: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    metric: 'RAIN_PROBABILITY',
    comparator: 'GTE',
    thresholdValue: 60.0,
    cooldownMinutes: 120,
    isActive: true,
  },
];

// GET /api/v1/alerts/rules
alertsRouter.get('/rules', (req: Request, res: Response) => {
  return res.json(alertRules);
});

// POST /api/v1/alerts/rules
alertsRouter.post('/rules', (req: Request, res: Response) => {
  const { locationName, latitude, longitude, metric, comparator, thresholdValue, cooldownMinutes } = req.body;

  if (!locationName || latitude == null || longitude == null || !metric || !comparator || thresholdValue == null) {
    return res.status(400).json({ error: 'Missing required alert rule fields.' });
  }

  const newRule: AlertRule = {
    id: `rule-${Date.now()}`,
    userId: 'user-demo-01',
    locationName,
    latitude: Number(latitude),
    longitude: Number(longitude),
    metric,
    comparator,
    thresholdValue: Number(thresholdValue),
    cooldownMinutes: Number(cooldownMinutes) || 180,
    isActive: true,
  };

  alertRules.push(newRule);
  return res.status(201).json(newRule);
});

// DELETE /api/v1/alerts/rules/:id
alertsRouter.delete('/rules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialCount = alertRules.length;
  alertRules = alertRules.filter((r) => r.id !== id);

  if (alertRules.length === initialCount) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  return res.json({ success: true, message: 'Rule deleted' });
});

// POST /api/v1/alerts/evaluate (Evaluates all rules against current weather)
alertsRouter.post('/evaluate', async (req: Request, res: Response) => {
  const triggeredNotifications = [];

  for (const rule of alertRules) {
    if (!rule.isActive) continue;

    try {
      const weather = await globalWeatherService.getWeather(rule.latitude, rule.longitude);
      const evalResult = evaluateAlertRule(rule, {
        temperature: weather.current.temperature,
        feelsLike: weather.current.feelsLike,
        windSpeed: weather.current.windSpeed,
        precipitationProbability: weather.hourly[0]?.precipitationProbability || 0,
      });

      if (evalResult.triggered) {
        rule.lastTriggeredAt = new Date();
        const notification = globalNotificationService.send({
          ruleId: rule.id,
          metric: rule.metric,
          message: evalResult.message,
          channel: 'IN_APP',
        });
        triggeredNotifications.push(notification);
      }
    } catch (err: any) {
      console.warn(`Could not evaluate rule ${rule.id}:`, err.message);
    }
  }

  return res.json({
    evaluatedCount: alertRules.length,
    triggeredCount: triggeredNotifications.length,
    notifications: triggeredNotifications,
  });
});

// GET /api/v1/alerts/notifications
alertsRouter.get('/notifications', (req: Request, res: Response) => {
  return res.json(globalNotificationService.getAll());
});

// POST /api/v1/alerts/notifications/:id/read
alertsRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = globalNotificationService.markAsRead(id);
  if (!success) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  return res.json({ success: true });
});
