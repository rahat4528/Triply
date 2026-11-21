import { Router, Request, Response } from 'express';

export const preferencesRouter = Router();

let userPreferences = {
  temperatureUnit: 'CELSIUS',
  speedUnit: 'KM_H',
  pressureUnit: 'HPA',
  precipitationUnit: 'MM',
  quietHoursStart: 22,
  quietHoursEnd: 7,
};

// GET /api/v1/preferences
preferencesRouter.get('/', (req: Request, res: Response) => {
  return res.json(userPreferences);
});

// PUT /api/v1/preferences
preferencesRouter.put('/', (req: Request, res: Response) => {
  const { temperatureUnit, speedUnit, pressureUnit, precipitationUnit, quietHoursStart, quietHoursEnd } = req.body;

  userPreferences = {
    ...userPreferences,
    ...(temperatureUnit && { temperatureUnit }),
    ...(speedUnit && { speedUnit }),
    ...(pressureUnit && { pressureUnit }),
    ...(precipitationUnit && { precipitationUnit }),
    ...(quietHoursStart !== undefined && { quietHoursStart }),
    ...(quietHoursEnd !== undefined && { quietHoursEnd }),
  };

  return res.json(userPreferences);
});
