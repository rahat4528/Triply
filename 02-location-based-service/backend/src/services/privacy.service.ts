export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: 'NEARBY_SEARCH' | 'GEOFENCING' | 'LIVE_SHARING' | 'LOCATION_HISTORY';
  permissionState: 'GRANTED' | 'REVOKED';
  grantedAt: string;
  revokedAt?: string | null;
}

export class PrivacyService {
  private consents: ConsentRecord[] = [
    {
      id: 'cst-nearby',
      userId: 'usr-loc-demo-01',
      purpose: 'NEARBY_SEARCH',
      permissionState: 'GRANTED',
      grantedAt: new Date().toISOString(),
    },
    {
      id: 'cst-geofencing',
      userId: 'usr-loc-demo-01',
      purpose: 'GEOFENCING',
      permissionState: 'GRANTED',
      grantedAt: new Date().toISOString(),
    },
  ];

  getConsents(userId: string): ConsentRecord[] {
    return this.consents.filter((c) => c.userId === userId);
  }

  setConsent(userId: string, purpose: ConsentRecord['purpose'], state: 'GRANTED' | 'REVOKED'): ConsentRecord {
    let consent = this.consents.find((c) => c.userId === userId && c.purpose === purpose);
    if (consent) {
      consent.permissionState = state;
      if (state === 'REVOKED') {
        consent.revokedAt = new Date().toISOString();
      }
    } else {
      consent = {
        id: `cst-${Date.now()}`,
        userId,
        purpose,
        permissionState: state,
        grantedAt: new Date().toISOString(),
        revokedAt: state === 'REVOKED' ? new Date().toISOString() : null,
      };
      this.consents.push(consent);
    }
    return consent;
  }

  exportData(userId: string): Record<string, any> {
    return {
      userId,
      exportTimestamp: new Date().toISOString(),
      consents: this.getConsents(userId),
      notice: 'Personal location data exported under privacy compliance rules.',
    };
  }

  purgeData(userId: string): { success: boolean; purgedRecordsCount: number } {
    const initialLen = this.consents.length;
    this.consents = this.consents.filter((c) => c.userId !== userId);
    return {
      success: true,
      purgedRecordsCount: initialLen - this.consents.length,
    };
  }
}

export const globalPrivacyService = new PrivacyService();
