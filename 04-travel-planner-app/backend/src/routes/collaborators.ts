import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getTripsStore } from './trips';
import { seedData } from '../../../database/seed';

export const collaboratorsRouter = Router({ mergeParams: true });

// Active in-memory invitations store
interface InvitationRecord {
  id: string;
  tripId: string;
  email: string;
  token: string;
  role: 'EDITOR' | 'VIEWER';
  expiresAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
}

const invitations: InvitationRecord[] = [];

export function getInvitationsStore() {
  return invitations;
}

// GET trip members
collaboratorsRouter.get('/', (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const membersWithProfiles = trip.members.map(m => {
    const user = seedData.users.find(u => u.id === m.userId);
    return {
      memberId: m.id,
      userId: m.userId,
      role: m.role,
      name: user ? user.name : 'Guest User',
      email: user ? user.email : '',
      avatarUrl: user ? user.avatarUrl : undefined
    };
  });

  res.json({ success: true, data: membersWithProfiles });
});

// POST invite collaborator
collaboratorsRouter.post('/invitations', (req: Request, res: Response) => {
  const tripId = req.params.tripId;
  const trips = getTripsStore();
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  const { email, role, expiresInHours } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const hours = Number(expiresInHours) || 48;
  const expiresAt = new Date(Date.now() + hours * 3600 * 1000);

  const invite: InvitationRecord = {
    id: `inv-${uuidv4().substring(0, 8)}`,
    tripId,
    email: email.toLowerCase(),
    token,
    role: role === 'EDITOR' ? 'EDITOR' : 'VIEWER',
    expiresAt,
    status: 'PENDING'
  };

  invitations.push(invite);

  res.status(201).json({
    success: true,
    data: {
      invitationId: invite.id,
      email: invite.email,
      role: invite.role,
      token: invite.token,
      expiresAt: invite.expiresAt.toISOString(),
      joinUrl: `/join?token=${token}`
    }
  });
});

// POST accept invitation
collaboratorsRouter.post('/invitations/accept', (req: Request, res: Response) => {
  const { token, userId } = req.body;
  if (!token || !userId) {
    return res.status(400).json({ success: false, error: 'token and userId are required' });
  }

  const invite = invitations.find(i => i.token === token);
  if (!invite) {
    return res.status(404).json({ success: false, error: 'Invalid invitation token' });
  }

  if (invite.status !== 'PENDING') {
    return res.status(400).json({ success: false, error: `Invitation is ${invite.status.toLowerCase()}` });
  }

  if (new Date() > invite.expiresAt) {
    invite.status = 'EXPIRED';
    return res.status(400).json({ success: false, error: 'Invitation token has expired' });
  }

  const trips = getTripsStore();
  const trip = trips.find(t => t.id === invite.tripId);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Associated trip not found' });
  }

  // Check if already a member
  const existing = trip.members.find(m => m.userId === userId);
  if (existing) {
    existing.role = invite.role; // Upgrade or refresh
  } else {
    trip.members.push({
      id: `mem-${uuidv4().substring(0, 8)}`,
      userId,
      role: invite.role
    });
  }

  invite.status = 'ACCEPTED';

  res.json({
    success: true,
    message: `Accepted invitation as ${invite.role}`,
    tripId: trip.id,
    role: invite.role
  });
});
