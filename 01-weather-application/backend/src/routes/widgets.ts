import { Router, Request, Response } from 'express';
import { globalWeatherService } from '../services/weather.service';
import { validateCoordinates } from '../../../integrations/coordinate-validator';

export const widgetsRouter = Router();

interface WidgetConfigEntry {
  token: string;
  locationName: string;
  latitude: number;
  longitude: number;
  theme: string;
  allowedMetrics: string[];
}

const registeredWidgets = new Map<string, WidgetConfigEntry>();

// Initial sample widget
registeredWidgets.set('wgt_sample_london', {
  token: 'wgt_sample_london',
  locationName: 'London',
  latitude: 51.5074,
  longitude: -0.1278,
  theme: 'auto',
  allowedMetrics: ['temperature', 'condition', 'wind', 'humidity'],
});

// POST /api/v1/widgets/generate
widgetsRouter.post('/generate', (req: Request, res: Response) => {
  const { locationName, latitude, longitude, theme, allowedMetrics } = req.body;
  const val = validateCoordinates(latitude, longitude);

  if (!val.isValid) {
    return res.status(400).json({ error: val.error });
  }

  const token = `wgt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const widget: WidgetConfigEntry = {
    token,
    locationName: locationName || `Location (${val.latitude.toFixed(2)}, ${val.longitude.toFixed(2)})`,
    latitude: val.latitude,
    longitude: val.longitude,
    theme: theme || 'auto',
    allowedMetrics: allowedMetrics || ['temperature', 'condition', 'wind', 'humidity'],
  };

  registeredWidgets.set(token, widget);

  const snippet = `<iframe src="${req.protocol}://${req.get('host')}/widget/${token}" width="320" height="180" frameborder="0" style="border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);"></iframe>`;

  return res.status(201).json({
    token,
    widget,
    embedSnippet: snippet,
  });
});

// GET /api/v1/widgets/:token/data
widgetsRouter.get('/:token/data', async (req: Request, res: Response) => {
  const { token } = req.params;
  const widget = registeredWidgets.get(token);

  if (!widget) {
    return res.status(404).json({ error: 'Invalid or expired widget token' });
  }

  try {
    const weather = await globalWeatherService.getWeather(widget.latitude, widget.longitude);
    return res.json({
      locationName: widget.locationName,
      theme: widget.theme,
      allowedMetrics: widget.allowedMetrics,
      current: weather.current,
      attribution: weather.dataSource.attribution,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve widget weather data' });
  }
});
