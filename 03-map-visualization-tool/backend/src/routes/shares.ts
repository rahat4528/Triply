import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';

export const sharesRouter = Router();

interface MapShareRecord {
  token: string;
  projectId: string;
  role: 'VIEWER' | 'EDITOR';
  expiresAt: string;
  isRevoked: boolean;
}

const mapShares = new Map<string, MapShareRecord>();

// Seed sample share
mapShares.set('share-london-air', {
  token: 'share-london-air',
  projectId: 'proj-london-air-quality',
  role: 'VIEWER',
  expiresAt: new Date(Date.now() + 86400 * 1000 * 7).toISOString(),
  isRevoked: false,
});

// POST /api/v1/shares
sharesRouter.post('/', (req: Request, res: Response) => {
  const { projectId, role, durationDays } = req.body;
  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' });
  }

  const token = `shr_${crypto.randomBytes(10).toString('hex')}`;
  const days = Number(durationDays) || 7;
  const expiresAt = new Date(Date.now() + days * 86400 * 1000).toISOString();

  const record: MapShareRecord = {
    token,
    projectId,
    role: role === 'EDITOR' ? 'EDITOR' : 'VIEWER',
    expiresAt,
    isRevoked: false,
  };

  mapShares.set(token, record);
  return res.status(201).json({
    token,
    shareUrl: `${req.protocol}://${req.get('host')}/shared-map/${token}`,
    expiresAt,
  });
});

// GET /api/v1/shares/:token
sharesRouter.get('/:token', (req: Request, res: Response) => {
  const record = mapShares.get(req.params.token);
  if (!record || record.isRevoked || new Date() > new Date(record.expiresAt)) {
    return res.status(403).json({ error: 'Share link expired or revoked.' });
  }

  return res.json(record);
});

// DELETE /api/v1/shares/:token
sharesRouter.delete('/:token', (req: Request, res: Response) => {
  const record = mapShares.get(req.params.token);
  if (!record) {
    return res.status(404).json({ error: 'Share token not found' });
  }
  record.isRevoked = true;
  return res.json({ success: true, message: 'Share link revoked.' });
});
