import { Router, Request, Response } from 'express';
import { globalPrivacyService } from '../services/privacy.service';
import { globalGeofenceService } from '../services/geofence.service';

export const privacyRouter = Router();

// GET /api/v1/privacy/consent
privacyRouter.get('/consent', (req: Request, res: Response) => {
  return res.json(globalPrivacyService.getConsents('usr-loc-demo-01'));
});

// POST /api/v1/privacy/consent
privacyRouter.post('/consent', (req: Request, res: Response) => {
  const { purpose, state } = req.body;
  if (!purpose || !state) {
    return res.status(400).json({ error: 'purpose and state required' });
  }

  const updated = globalPrivacyService.setConsent('usr-loc-demo-01', purpose, state);
  return res.json(updated);
});

// GET /api/v1/privacy/export
privacyRouter.get('/export', (req: Request, res: Response) => {
  const exportPayload = globalPrivacyService.exportData('usr-loc-demo-01');
  return res.json({
    ...exportPayload,
    geofenceEvents: globalGeofenceService.getEventLogs(),
  });
});

// DELETE /api/v1/privacy/purge
privacyRouter.delete('/purge', (req: Request, res: Response) => {
  globalGeofenceService.clearLogs();
  const result = globalPrivacyService.purgeData('usr-loc-demo-01');
  return res.json({
    success: true,
    message: 'All personal location records, consent logs, and geofence events permanently purged.',
    details: result,
  });
});
