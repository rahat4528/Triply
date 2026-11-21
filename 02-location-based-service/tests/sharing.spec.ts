import { SharingService } from '../backend/src/services/sharing.service';

describe('Consented Location Sharing Lifecycle', () => {
  let sharingService: SharingService;

  beforeEach(() => {
    sharingService = new SharingService();
  });

  it('creates active time-limited sharing record', () => {
    const record = sharingService.createShare({
      senderId: 'user-01',
      recipientEmail: 'friend@example.com',
      latitude: 51.5074,
      longitude: -0.1278,
      durationMinutes: 30,
    });

    expect(record.token).toBeDefined();
    expect(record.recipientEmail).toBe('friend@example.com');
    expect(record.isRevoked).toBe(false);

    const lookup = sharingService.getShareByToken(record.token);
    expect(lookup.valid).toBe(true);
    expect(lookup.share?.lastLatitude).toBe(51.5074);
  });

  it('revokes sharing instantly and blocks recipient access', () => {
    const record = sharingService.createShare({
      senderId: 'user-01',
      recipientEmail: 'friend@example.com',
      latitude: 51.5074,
      longitude: -0.1278,
      durationMinutes: 60,
    });

    const revoked = sharingService.revokeShare(record.token, 'user-01');
    expect(revoked).toBe(true);

    const lookup = sharingService.getShareByToken(record.token);
    expect(lookup.valid).toBe(false);
    expect(lookup.reason).toContain('revoked');
  });

  it('rejects expired sharing links', () => {
    const expiredRecord = sharingService.createShare({
      senderId: 'user-01',
      recipientEmail: 'friend@example.com',
      latitude: 51.5074,
      longitude: -0.1278,
      durationMinutes: -10, // Expired in the past
    });

    const lookup = sharingService.getShareByToken(expiredRecord.token);
    expect(lookup.valid).toBe(false);
    expect(lookup.reason).toContain('expired');
  });
});
