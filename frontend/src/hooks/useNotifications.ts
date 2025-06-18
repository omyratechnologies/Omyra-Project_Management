import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  notificationService, 
  connectNotificationService, 
  disconnectNotificationService,
  RealTimeNotification,
  NotificationSummary,
  NotificationPreferences
} from '@/services/notificationService';
import { apiClient } from '@/lib/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const { profile, token } = useAuth();

  // Initialize notification service
  useEffect(() => {
    if (!profile || !token) return;

    const initializeService = async () => {
      try {
        setIsLoading(true);
        await connectNotificationService(token);
        setIsConnected(true);
        
        // Load initial notifications
        loadNotifications();
        loadPreferences();
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();

    // Cleanup on unmount or auth change
    return () => {
      disconnectNotificationService();
      setIsConnected(false);
    };
  }, [profile, token]);

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleNewNotification = (notification: RealTimeNotification) => {
      // Validate notification structure
      if (!notification || !notification.id || !notification.timestamp) {
        console.warn('Received invalid notification:', notification);
        return;
      }
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleSummaryUpdate = (summary: NotificationSummary) => {
      setUnreadCount(summary.unreadCount);
      // Update recent notifications
      setNotifications(prev => {
        const newNotifications = [...prev];
        (summary.recentNotifications || []).forEach(newNotif => {
          // Validate notification before processing
          if (!newNotif || !newNotif.id || !newNotif.timestamp) {
            console.warn('Received invalid notification in summary:', newNotif);
            return;
          }
          
          const existingIndex = newNotifications.findIndex(n => n.id === newNotif.id);
          if (existingIndex === -1) {
            newNotifications.unshift(newNotif);
          } else {
            newNotifications[existingIndex] = newNotif;
          }
        });
        return newNotifications.slice(0, 50); // Keep only latest 50
      });
    };

    const handleNotificationsList = (notificationsList: RealTimeNotification[]) => {
      // Filter out invalid notifications
      const validNotifications = (notificationsList || []).filter(notification => 
        notification && notification.id && notification.timestamp
      );
      setNotifications(validNotifications);
    };

    const handlePreferencesUpdate = (data: { success: boolean }) => {
      if (data.success) {
        loadPreferences();
      }
    };

    notificationService.on('new_notification', handleNewNotification);
    notificationService.on('summary_updated', handleSummaryUpdate);
    notificationService.on('notifications_list', handleNotificationsList);
    notificationService.on('preferences_updated', handlePreferencesUpdate);

    return () => {
      notificationService.off('new_notification', handleNewNotification);
      notificationService.off('summary_updated', handleSummaryUpdate);
      notificationService.off('notifications_list', handleNotificationsList);
      notificationService.off('preferences_updated', handlePreferencesUpdate);
    };
  }, [isConnected]);

  const loadNotifications = useCallback(async (options: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
    priority?: string;
  } = {}) => {
    try {
      if (isConnected) {
        notificationService.getNotifications(options);
      } else {
        // Fallback to REST API
        const response = await apiClient.getNotifications(options);
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [isConnected]);

  const loadPreferences = useCallback(async () => {
    try {
      const response = await apiClient.getNotificationPreferences();
      setPreferences(response.preferences);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      if (isConnected) {
        notificationService.markAsRead(notificationId);
      } else {
        await apiClient.markNotificationAsRead(notificationId);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [isConnected]);

  const markAllAsRead = useCallback(async () => {
    try {
      if (isConnected) {
        notificationService.markAllAsRead();
      } else {
        await apiClient.markAllNotificationsAsRead();
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [isConnected]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await apiClient.deleteNotification(notificationId);
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  const clearAllNotifications = useCallback(async () => {
    try {
      await apiClient.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    try {
      if (isConnected) {
        notificationService.updatePreferences(newPreferences);
      } else {
        await apiClient.updateNotificationPreferences(newPreferences);
      }
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }, [isConnected]);

  const testNotification = useCallback(() => {
    if (isConnected) {
      notificationService.testNotification();
    }
  }, [isConnected]);

  const requestNotificationPermission = useCallback(async () => {
    return await notificationService.requestNotificationPermission();
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    preferences,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    testNotification,
    requestNotificationPermission,
    connectionStatus: notificationService.getConnectionStatus()
  };
};
