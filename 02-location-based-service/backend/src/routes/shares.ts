import { Router, Request, Response } from 'express';
import { globalSharingService } from '../services/sharing.service';

export const sharesRouter = Router();

// POST /api/v1/shares
sharesRouter.post('/', (req: Request, res: Response) => {
  const { recipientEmail, latitude, longitude, accuracy, durationMinutes } = req.body;

  if (!recipientEmail || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'recipientEmail, latitude, and longitude required.' });
  }

  const share = globalSharingService.createShare({
    senderId: 'usr-loc-demo-01',
    recipientEmail,
    latitude: Number(latitude),
    longitude: Number(longitude),
    accuracy: Number(accuracy) || 15,
    durationMinutes: Number(durationMinutes) || 60,
  });

  return res.status(201).json({
    success: true,
    share,
    shareUrl: `${req.protocol}://${req.get('host')}/shared/${share.token}`,
  });
});

// GET /api/v1/shares/active
sharesRouter.get('/active', (req: Request, res: Response) => {
  return res.json(globalSharingService.getActiveShares('usr-loc-demo-01'));
});

// DELETE /api/v1/shares/:id/revoke
sharesRouter.delete('/:id/revoke', (req: Request, res: Response) => {
  const { id } = req.params;
  const revoked = globalSharingService.revokeShare(id, 'usr-loc-demo-01');
  if (!revoked) {
    return res.status(404).json({ error: 'Share record not found or already revoked.' });
  }
  return res.json({ success: true, message: 'Sharing permission immediately revoked.' });
});

// GET /api/v1/shares/view/:token
sharesRouter.get('/view/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const result = globalSharingService.getShareByToken(token);
  if (!result.valid) {
    return res.status(403).json({ error: result.reason });
  }

  return res.json({
    recipient: result.share!.recipientEmail,
    latitude: result.share!.lastLatitude,
    longitude: result.share!.lastLongitude,
    accuracy: result.share!.lastAccuracy,
    lastUpdated: result.share!.lastUpdated,
    expiresAt: result.share!.expiresAt,
  });
});
