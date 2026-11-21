import { encryptCoordinate, decryptCoordinate, sanitizeLog, isExpiredRetention } from '../geolocation/privacy-guard';

describe('Privacy Guard & Data Protection', () => {
  it('encrypts and decrypts coordinates losslessly', () => {
    const originalLat = 51.5074;
    const encrypted = encryptCoordinate(originalLat);
    expect(encrypted).not.toEqual(originalLat.toString());

    const decrypted = decryptCoordinate(encrypted);
    expect(decrypted).toBeCloseTo(originalLat, 4);
  });

  it('redacts high-precision coordinates from log traces', () => {
    const rawLog = 'User ping received at 51.507421, -0.127812 with status 200';
    const sanitized = sanitizeLog(rawLog);
    expect(sanitized).not.toContain('51.507421');
    expect(sanitized).toContain('[REDACTED_COORD]');
  });

  it('evaluates data retention expiration against user policy', () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 10 * 86400 * 1000); // 10 days old
    const old = new Date(now.getTime() - 45 * 86400 * 1000);    // 45 days old

    expect(isExpiredRetention(recent, 30, now)).toBe(false);
    expect(isExpiredRetention(old, 30, now)).toBe(true);
  });
});
