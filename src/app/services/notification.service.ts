export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeMockNotifications();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      this.notifications = JSON.parse(stored);
    }
  }

  private saveToStorage() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.notifications));
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    listener(this.notifications); // Immediate callback with current state
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private initializeMockNotifications() {
    if (this.notifications.length === 0) {
      this.notifications = [
        {
          id: 'notif-001',
          title: 'Application Sanctioned',
          message: 'Your Earned Leave application (APP-2026-001) has been sanctioned',
          type: 'success',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/employee/applications',
          actionText: 'View Application',
        },
        {
          id: 'notif-002',
          title: 'New Application for Review',
          message: 'Application APP-2026-005 is pending your review',
          type: 'info',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          actionUrl: '/co/review',
          actionText: 'Review Now',
        },
        {
          id: 'notif-003',
          title: 'Leave Balance Updated',
          message: 'Your Earned Leave balance has been updated to 18 days',
          type: 'info',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
        },
      ];
      this.saveToStorage();
    }
  }

  getNotifications(): Notification[] {
    return [...this.notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveToStorage();
      this.notify();
    }
  }

  markAllAsRead() {
    this.notifications.forEach((n) => (n.isRead = true));
    this.saveToStorage();
    this.notify();
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.notifications.unshift(newNotification);
    this.saveToStorage();
    this.notify();
  }

  clearAll() {
    this.notifications = [];
    this.saveToStorage();
    this.notify();
  }
}

export const notificationService = new NotificationService();
