import * as crypto from 'crypto';

const ENCRYPTION_KEY = crypto.scryptSync(process.env.JWT_SECRET || 'triply-location-secret-salt-2026', 'salt', 32);
const ALGORITHM = 'aes-256-cbc';

/**
 * Field-level encryption for saved sensitive location coordinates
 */
export function encryptCoordinate(coord: number): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(coord.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptCoordinate(encryptedPayload: string): number {
  const [ivHex, encryptedText] = encryptedPayload.split(':');
  if (!ivHex || !encryptedText) return 0;
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return parseFloat(decrypted);
}

/**
 * Ensures coordinates are sanitized out of log messages
 */
export function sanitizeLog(message: string): string {
  return message.replace(/-?\d+\.\d{3,}/g, '[REDACTED_COORD]');
}

/**
 * Evaluates whether historical location record is older than user retention policy
 */
export function isExpiredRetention(recordDate: Date, retentionDays: number, now = new Date()): boolean {
  const diffDays = (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > retentionDays;
}
