import crypto from 'crypto';

interface Invitation {
  token: string;
  role: 'EDITOR' | 'VIEWER';
  expiresAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
}

class InvitationService {
  static createInvitation(role: 'EDITOR' | 'VIEWER', ttlHours = 48): Invitation {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);

    return {
      token,
      role,
      expiresAt,
      status: 'PENDING'
    };
  }

  static validateAndAccept(invite: Invitation, currentTime = new Date()): { success: boolean; error?: string } {
    if (invite.status !== 'PENDING') {
      return { success: false, error: `Invitation is already ${invite.status.toLowerCase()}` };
    }

    if (currentTime > invite.expiresAt) {
      invite.status = 'EXPIRED';
      return { success: false, error: 'Invitation has expired' };
    }

    invite.status = 'ACCEPTED';
    return { success: true };
  }

  static revoke(invite: Invitation): void {
    if (invite.status === 'PENDING') {
      invite.status = 'REVOKED';
    }
  }
}

describe('InvitationTokenService', () => {
  it('generates a secure 48-character hex token', () => {
    const invite = InvitationService.createInvitation('EDITOR', 24);
    expect(invite.token).toHaveLength(48);
    expect(invite.status).toBe('PENDING');
    expect(invite.role).toBe('EDITOR');
  });

  it('allows acceptance of a valid pending invitation', () => {
    const invite = InvitationService.createInvitation('VIEWER', 48);
    const result = InvitationService.validateAndAccept(invite);
    expect(result.success).toBe(true);
    expect(invite.status).toBe('ACCEPTED');
  });

  it('rejects expired invitations', () => {
    const invite = InvitationService.createInvitation('EDITOR', 1);
    const pastTime = new Date(Date.now() + 2 * 3600 * 1000); // 2 hours later
    const result = InvitationService.validateAndAccept(invite, pastTime);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invitation has expired');
    expect(invite.status).toBe('EXPIRED');
  });

  it('prevents reusing an already accepted invitation', () => {
    const invite = InvitationService.createInvitation('EDITOR', 24);
    InvitationService.validateAndAccept(invite);

    const secondAttempt = InvitationService.validateAndAccept(invite);
    expect(secondAttempt.success).toBe(false);
    expect(secondAttempt.error).toContain('already accepted');
  });

  it('handles revocation of pending invitations', () => {
    const invite = InvitationService.createInvitation('VIEWER', 24);
    InvitationService.revoke(invite);
    expect(invite.status).toBe('REVOKED');

    const attempt = InvitationService.validateAndAccept(invite);
    expect(attempt.success).toBe(false);
    expect(attempt.error).toContain('already revoked');
  });
});
