import { Router, Request, Response } from 'express';
import { globalWeatherService } from '../services/weather.service';
import { validateCoordinates } from '../../../integrations/coordinate-validator';
import { convertTemperature, convertSpeed, convertPressure, convertPrecipitation, TemperatureUnit, SpeedUnit, PressureUnit, PrecipitationUnit } from '../../../integrations/units';

export const weatherRouter = Router();

// GET /api/v1/weather/current?lat=&lon=&tempUnit=&speedUnit=
weatherRouter.get('/current', async (req: Request, res: Response) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const val = validateCoordinates(lat, lon);

  if (!val.isValid) {
    return res.status(400).json({ error: val.error, isPotentialSwap: val.isPotentialSwap });
  }

  try {
    const payload = await globalWeatherService.getWeather(val.latitude, val.longitude);
    
    // Apply unit conversions if requested
    const tempUnit = (req.query.tempUnit as TemperatureUnit) || 'CELSIUS';
    const speedUnit = (req.query.speedUnit as SpeedUnit) || 'KM_H';
    const pressureUnit = (req.query.pressureUnit as PressureUnit) || 'HPA';

    const convertedCurrent = {
      ...payload.current,
      temperature: convertTemperature(payload.current.temperature, tempUnit),
      feelsLike: convertTemperature(payload.current.feelsLike, tempUnit),
      windSpeed: convertSpeed(payload.current.windSpeed, speedUnit),
      pressure: convertPressure(payload.current.pressure, pressureUnit),
    };

    return res.json({
      ...payload,
      current: convertedCurrent,
      units: {
        temperature: tempUnit,
        speed: speedUnit,
        pressure: pressureUnit,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve weather conditions' });
  }
});

// GET /api/v1/weather/forecast?lat=&lon=
weatherRouter.get('/forecast', async (req: Request, res: Response) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const val = validateCoordinates(lat, lon);

  if (!val.isValid) {
    return res.status(400).json({ error: val.error, isPotentialSwap: val.isPotentialSwap });
  }

  try {
    const payload = await globalWeatherService.getWeather(val.latitude, val.longitude);
    return res.json(payload);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve forecast' });
  }
});

// GET /api/v1/weather/historical?lat=&lon=&startDate=&endDate=
weatherRouter.get('/historical', async (req: Request, res: Response) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const val = validateCoordinates(lat, lon);
  if (!val.isValid) {
    return res.status(400).json({ error: val.error });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate (YYYY-MM-DD) are required.' });
  }

  try {
    const result = await globalWeatherService.getHistoricalWeather(val.latitude, val.longitude, startDate, endDate);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve historical reanalysis data' });
  }
});

// POST /api/v1/weather/compare
weatherRouter.post('/compare', async (req: Request, res: Response) => {
  const { locations } = req.body;
  if (!Array.isArray(locations) || locations.length === 0) {
    return res.status(400).json({ error: 'Array of locations {lat, lon, name} required' });
  }

  try {
    const results = await globalWeatherService.compareLocations(locations);
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Location comparison failed' });
  }
});
