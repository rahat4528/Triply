import * as crypto from 'crypto';

export interface LocationShareRecord {
  id: string;
  token: string;
  senderId: string;
  recipientEmail: string;
  lastLatitude: number;
  lastLongitude: number;
  lastAccuracy?: number;
  lastUpdated: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
}

export class SharingService {
  private shares = new Map<string, LocationShareRecord>();

  createShare(options: {
    senderId: string;
    recipientEmail: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    durationMinutes: number;
  }): LocationShareRecord {
    const token = `shr_${crypto.randomBytes(12).toString('hex')}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + options.durationMinutes * 60 * 1000);

    const record: LocationShareRecord = {
      id: `share-${Date.now()}`,
      token,
      senderId: options.senderId,
      recipientEmail: options.recipientEmail,
      lastLatitude: options.latitude,
      lastLongitude: options.longitude,
      lastAccuracy: options.accuracy,
      lastUpdated: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isRevoked: false,
      createdAt: now.toISOString(),
    };

    this.shares.set(token, record);
    return record;
  }

  updateLocation(senderId: string, latitude: number, longitude: number, accuracy?: number): void {
    const now = new Date();
    for (const share of this.shares.values()) {
      if (share.senderId === senderId && !share.isRevoked && new Date(share.expiresAt) > now) {
        share.lastLatitude = latitude;
        share.lastLongitude = longitude;
        share.lastAccuracy = accuracy;
        share.lastUpdated = now.toISOString();
      }
    }
  }

  revokeShare(idOrToken: string, senderId: string): boolean {
    for (const share of this.shares.values()) {
      if ((share.id === idOrToken || share.token === idOrToken) && share.senderId === senderId) {
        share.isRevoked = true;
        return true;
      }
    }
    return false;
  }

  getActiveShares(senderId: string): LocationShareRecord[] {
    const now = new Date();
    const active: LocationShareRecord[] = [];
    for (const share of this.shares.values()) {
      if (share.senderId === senderId && !share.isRevoked && new Date(share.expiresAt) > now) {
        active.push(share);
      }
    }
    return active;
  }

  getShareByToken(token: string): { valid: boolean; share?: LocationShareRecord; reason?: string } {
    const share = this.shares.get(token);
    if (!share) {
      return { valid: false, reason: 'Share token not found.' };
    }
    if (share.isRevoked) {
      return { valid: false, reason: 'Location sharing was revoked by the sender.' };
    }
    if (new Date() > new Date(share.expiresAt)) {
      return { valid: false, reason: 'Location sharing link has expired.' };
    }
    return { valid: true, share };
  }
}

export const globalSharingService = new SharingService();
