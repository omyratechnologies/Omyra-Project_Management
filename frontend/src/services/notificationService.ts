import { io, Socket } from 'socket.io-client';
import { toast } from '@/hooks/use-toast';

export interface RealTimeNotification {
  id: string;
  type: 'task_assigned' | 'task_due' | 'task_completed' | 'project_update' | 'project_milestone' | 'meeting_reminder' | 'feedback_response' | 'system_alert' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable: boolean;
  action?: string;
  link?: string;
  metadata?: {
    projectId?: string;
    taskId?: string;
    meetingId?: string;
    feedbackId?: string;
    entityId?: string;
    entityType?: string;
    [key: string]: any;
  };
  timestamp: string;
  read: boolean;
}

export interface NotificationSummary {
  unreadCount: number;
  recentNotifications: RealTimeNotification[];
}

export interface NotificationPreferences {
  email: {
    taskAssigned: boolean;
    taskDue: boolean;
    projectUpdates: boolean;
    meetingReminders: boolean;
    feedbackResponse: boolean;
    systemAlerts: boolean;
  };
  push: {
    taskAssigned: boolean;
    taskDue: boolean;
    projectUpdates: boolean;
    meetingReminders: boolean;
    feedbackResponse: boolean;
    systemAlerts: boolean;
  };
  realTime: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
}

class RealTimeNotificationService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private notificationSound: HTMLAudioElement | null = null;
  
  constructor() {
    // Initialize notification sound
    this.initializeNotificationSound();
  }

  private initializeNotificationSound() {
    try {
      // Create a simple notification sound using Web Audio API
      this.notificationSound = new Audio();
      this.notificationSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBDWI1fPKgC4FJ3nO8+RVHW9laEfhJj2gvl6ohtLGcT6Vt/rOq2vf8pJQ8FMzCHetgJGwdYLGqq/5Bw/8d6rR5HJI/4qPjGRoLTnBz/Xk7eQrGn7zFJGZ4fUKGcFf/W5+8kIpJQmcJ4+g6GZWJ2V8iKs1NQoQOF6Zin+KmdnhVZMzEEwgXL7K5rqzwTl9tBOzAq5fAUUcEwegV6eTfQSRyGzm5uSFWM0d9qo+hPCXgDUJKVP9CJ3I8nB1SdJLCG5a5bbBqfAWRBKMJdBpIDQJLEOvO6lkaNFNzFmveTNUQEwNfWaKLTWZ/lE0RM1sNE9KRdRsEUKsZJbLHVMwKJ4vwKHggbV1J4M8V+VQ2GyO0LGMrO8P0fQAb4LEiNkqYkdXKxdVL9G2F7iDpOsz8FD1/Ik8TJUvRGGJGWFvxJ9E4/hUJjmU/M8xYKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L+K6lUqIe1Gd2JJtBXHrQE3eqJ8fFgkPEtHgUe4mEqJKFXlU+L';
    } catch (error) {
      console.warn('Could not initialize notification sound:', error);
    }
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5001';
      
      console.log('🔔 Attempting to connect to notification service:', { 
        wsUrl, 
        hasToken: !!token,
        tokenLength: token?.length 
      });
      
      this.socket = io(wsUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('🔔 Connected to notification service');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔔 Disconnected from notification service:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔔 Connection error:', error);
        console.error('🔔 Error details:', error.message, (error as any).type, (error as any).description);
        this.isConnected = false;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to notification service'));
        }
        this.reconnectAttempts++;
      });

      this.socket.on('error', (error) => {
        console.error('🔔 Socket error:', error);
      });

      this.socket.on('new_notification', (notification: RealTimeNotification) => {
        this.handleNewNotification(notification);
      });

      this.socket.on('notification_summary', (summary: NotificationSummary) => {
        this.emit('summary_updated', summary);
      });

      this.socket.on('preferences_updated', (data: { success: boolean }) => {
        this.emit('preferences_updated', data);
      });

      this.socket.on('notifications_list', (notifications: RealTimeNotification[]) => {
        this.emit('notifications_list', notifications);
      });

      // Set a timeout for connection
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 20000);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  private handleNewNotification(notification: RealTimeNotification): void {
    console.log('🔔 New notification received:', notification);

    // Play notification sound if enabled
    this.playNotificationSound();

    // Show browser notification if enabled
    this.showBrowserNotification(notification);

    // Show toast notification
    this.showToastNotification(notification);

    // Emit to listeners
    this.emit('new_notification', notification);
  }

  private async playNotificationSound(): Promise<void> {
    try {
      if (this.notificationSound) {
        // Reset the audio to the beginning
        this.notificationSound.currentTime = 0;
        await this.notificationSound.play();
      }
    } catch (error) {
      // Ignore audio play errors (e.g., user hasn't interacted with page)
      console.debug('Could not play notification sound:', error);
    }
  }

  private showBrowserNotification(notification: RealTimeNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: false
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.link) {
          window.location.href = notification.link;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds unless urgent
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  private showToastNotification(notification: RealTimeNotification): void {
    const variant = notification.priority === 'urgent' ? 'destructive' : 'default';
    
    toast({
      title: notification.title,
      description: notification.message,
      variant,
      duration: notification.priority === 'urgent' ? 0 : 5000, // Urgent notifications don't auto-dismiss
    });
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_notification_read', notificationId);
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_all_notifications_read');
    }
  }

  // Get notifications list
  getNotifications(options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
    priority?: string;
  } = {}): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_notifications', options);
    }
  }

  // Update notification preferences
  updatePreferences(preferences: NotificationPreferences): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_notification_preferences', preferences);
    }
  }

  // Event emitter functionality
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification event listener:', error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Test notification (for development)
  testNotification(): void {
    if (this.socket && this.isConnected) {
      const testNotification: RealTimeNotification = {
        id: 'test-' + Date.now(),
        type: 'general',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        priority: 'medium',
        actionable: false,
        timestamp: new Date().toISOString(),
        read: false
      };
      this.handleNewNotification(testNotification);
    }
  }
}

// Create singleton instance
export const notificationService = new RealTimeNotificationService();

// Auto-connect utility
export const connectNotificationService = async (token: string): Promise<void> => {
  try {
    await notificationService.connect(token);
    
    // Request notification permission
    await notificationService.requestNotificationPermission();
    
    console.log('🔔 Notification service initialized successfully');
  } catch (error) {
    console.error('🔔 Failed to initialize notification service:', error);
    throw error;
  }
};

// Auto-disconnect utility
export const disconnectNotificationService = (): void => {
  notificationService.disconnect();
  console.log('🔔 Notification service disconnected');
};
