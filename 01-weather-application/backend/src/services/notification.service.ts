export interface NotificationRecord {
  id: string;
  ruleId: string;
  metric: string;
  message: string;
  channel: 'IN_APP' | 'EMAIL' | 'WEB_PUSH';
  timestamp: string;
  isRead: boolean;
}

export class NotificationService {
  private notifications: NotificationRecord[] = [];

  isQuietHours(quietHoursStart?: number | null, quietHoursEnd?: number | null, currentHour = new Date().getHours()): boolean {
    if (quietHoursStart == null || quietHoursEnd == null) return false;
    if (quietHoursStart < quietHoursEnd) {
      return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
    }
    // Overnight quiet hours, e.g. 22 to 7
    return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
  }

  send(notification: Omit<NotificationRecord, 'id' | 'timestamp' | 'isRead'>, quietHours?: { start?: number | null; end?: number | null }): NotificationRecord {
    const quiet = this.isQuietHours(quietHours?.start, quietHours?.end);
    const record: NotificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...notification,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    this.notifications.unshift(record);

    // Mock Email Sink logging for development/testing
    if (notification.channel === 'EMAIL') {
      console.log(`[MOCK EMAIL SINK] To: user@triply.local | Subject: Weather Alert | Body: ${notification.message} ${quiet ? '(Suppressed audio: Quiet hours active)' : ''}`);
    }

    return record;
  }

  getAll(): NotificationRecord[] {
    return [...this.notifications];
  }

  markAsRead(id: string): boolean {
    const target = this.notifications.find((n) => n.id === id);
    if (target) {
      target.isRead = true;
      return true;
    }
    return false;
  }

  clear(): void {
    this.notifications = [];
  }
}

export const globalNotificationService = new NotificationService();
