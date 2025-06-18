import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { User, Profile, Notification } from '../models/index.js';
import { emailService, EmailMessage } from './emailService.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export interface NotificationData {
  userId: string | string[];
  type: 'task_assigned' | 'task_due' | 'task_completed' | 'project_update' | 'project_milestone' | 'meeting_reminder' | 'feedback_response' | 'system_alert' | 'general';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionable?: boolean;
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
  emailNotification?: boolean;
  pushNotification?: boolean;
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

class NotificationService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, string[]> = new Map(); // userId -> socketIds[]
  private notificationQueue: Map<string, NotificationData[]> = new Map(); // userId -> pending notifications

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [config.frontendUrl, 'http://localhost:5173', 'http://localhost:8080'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startNotificationProcessing();

    console.log('🔔 Real-time notification service initialized');
  }

  private setupMiddleware(): void {
    if (!this.io) return;

    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        console.log('🔐 Socket authentication attempt:', { 
          hasToken: !!token, 
          socketId: socket.id,
          auth: socket.handshake.auth,
          headers: Object.keys(socket.handshake.headers)
        });
        
        if (!token) {
          console.error('🔐 No authentication token provided');
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, config.jwtSecret) as any;
        const user = await User.findById(decoded.id).populate('profile');
        
        if (!user || !user.profile) {
          console.error('🔐 Invalid user or profile not found:', decoded.id);
          return next(new Error('Invalid user'));
        }

        console.log('🔐 Socket authentication successful:', { userId: user.id, role: (user.profile as any).role });
        socket.userId = user.id;
        socket.userRole = (user.profile as any).role;
        next();
      } catch (error) {
        console.error('🔐 Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 User ${socket.userId} connected (${socket.id})`);

      // Track connected user
      if (socket.userId) {
        this.addUserConnection(socket.userId, socket.id);
        
        // Send any queued notifications
        this.sendQueuedNotifications(socket.userId);
        
        // Send initial notification state
        this.sendNotificationSummary(socket.userId);
      }

      // Handle notification events
      socket.on('mark_notification_read', async (notificationId: string) => {
        if (socket.userId) {
          await this.markNotificationAsRead(socket.userId, notificationId);
        }
      });

      socket.on('mark_all_notifications_read', async () => {
        if (socket.userId) {
          await this.markAllNotificationsAsRead(socket.userId);
        }
      });

      socket.on('get_notifications', async (options: any) => {
        if (socket.userId) {
          const notifications = await this.getUserNotifications(socket.userId, options);
          socket.emit('notifications_list', notifications);
        }
      });

      socket.on('update_notification_preferences', async (preferences: NotificationPreferences) => {
        if (socket.userId) {
          await this.updateNotificationPreferences(socket.userId, preferences);
          socket.emit('preferences_updated', { success: true });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 User ${socket.userId} disconnected (${socket.id})`);
        if (socket.userId) {
          this.removeUserConnection(socket.userId, socket.id);
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  private addUserConnection(userId: string, socketId: string): void {
    const userSockets = this.connectedUsers.get(userId) || [];
    userSockets.push(socketId);
    this.connectedUsers.set(userId, userSockets);
  }

  private removeUserConnection(userId: string, socketId: string): void {
    const userSockets = this.connectedUsers.get(userId) || [];
    const filteredSockets = userSockets.filter(id => id !== socketId);
    
    if (filteredSockets.length > 0) {
      this.connectedUsers.set(userId, filteredSockets);
    } else {
      this.connectedUsers.delete(userId);
    }
  }

  private isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Main notification sending method
  async sendNotification(notificationData: NotificationData): Promise<void> {
    try {
      const userIds = Array.isArray(notificationData.userId) 
        ? notificationData.userId 
        : [notificationData.userId];

      for (const userId of userIds) {
        // Create notification in database
        const notification = await new Notification({
          userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          priority: notificationData.priority || 'medium',
          actionable: notificationData.actionable || false,
          action: notificationData.action,
          link: notificationData.link,
          metadata: notificationData.metadata
        }).save();

        // Send real-time notification if user is online
        if (this.isUserOnline(userId)) {
          await this.sendRealTimeNotification(userId, notification);
        } else {
          // Queue notification for when user comes online
          this.queueNotification(userId, notificationData);
        }

        // Send email notification if enabled
        if (notificationData.emailNotification !== false) {
          await this.sendEmailNotification(userId, notification);
        }

        // Log notification
        console.log(`🔔 Notification sent to user ${userId}: ${notificationData.title}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private async sendRealTimeNotification(userId: string, notification: any): Promise<void> {
    const userSockets = this.connectedUsers.get(userId) || [];
    
    for (const socketId of userSockets) {
      this.io?.to(socketId).emit('new_notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        actionable: notification.actionable,
        action: notification.action,
        link: notification.link,
        metadata: notification.metadata,
        timestamp: notification.createdAt,
        read: notification.read
      });
    }

    // Update notification summary
    this.sendNotificationSummary(userId);
  }

  private async sendNotificationSummary(userId: string): Promise<void> {
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    const recentNotifications = await Notification.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate([
        { path: 'metadata.projectId', select: 'title' },
        { path: 'metadata.taskId', select: 'title' }
      ]);
    
    const userSockets = this.connectedUsers.get(userId) || [];
    for (const socketId of userSockets) {
      this.io?.to(socketId).emit('notification_summary', {
        unreadCount,
        recentNotifications
      });
    }
  }

  private queueNotification(userId: string, notificationData: NotificationData): void {
    const userQueue = this.notificationQueue.get(userId) || [];
    userQueue.push(notificationData);
    this.notificationQueue.set(userId, userQueue);
  }

  private async sendQueuedNotifications(userId: string): Promise<void> {
    const queuedNotifications = this.notificationQueue.get(userId) || [];
    if (queuedNotifications.length === 0) return;

    for (const notificationData of queuedNotifications) {
      // Find the notification in database (it should already exist)
      const notification = await Notification.findOne({
        userId,
        title: notificationData.title,
        message: notificationData.message
      }).sort({ createdAt: -1 });

      if (notification) {
        await this.sendRealTimeNotification(userId, notification);
      }
    }

    // Clear queue
    this.notificationQueue.delete(userId);
  }

  private async sendEmailNotification(userId: string, notification: any): Promise<void> {
    try {
      const user = await User.findById(userId).populate('profile');
      if (!user || !user.email) return;

      // Check user's email notification preferences
      const preferences = await this.getNotificationPreferences(userId);
      const emailEnabled = this.shouldSendEmailForType(notification.type, preferences);
      
      if (!emailEnabled) return;

      const emailSubject = `[Omyra] ${notification.title}`;
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            ${notification.title}
          </h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0;">
              ${notification.message}
            </p>
          </div>
          ${notification.actionable && notification.link ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.frontendUrl}${notification.link}" 
                 style="background: #007bff; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; display: inline-block;">
                ${notification.action || 'View Details'}
              </a>
            </div>
          ` : ''}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
            <p>This notification was sent at ${new Date(notification.createdAt).toLocaleString()}</p>
            <p>You can manage your notification preferences in your account settings.</p>
          </div>
        </div>
      `;

      await emailService.sendEmail({
        from: config.emailFrom || 'noreply@omyra-project.com',
        to: user.email,
        subject: emailSubject,
        html: emailContent
      });

    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  private shouldSendEmailForType(type: string, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'task_assigned':
        return preferences.email.taskAssigned;
      case 'task_due':
        return preferences.email.taskDue;
      case 'project_update':
      case 'project_milestone':
        return preferences.email.projectUpdates;
      case 'meeting_reminder':
        return preferences.email.meetingReminders;
      case 'feedback_response':
        return preferences.email.feedbackResponse;
      case 'system_alert':
        return preferences.email.systemAlerts;
      default:
        return true;
    }
  }

  private async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true, updatedAt: new Date() }
      );

      // Send updated summary
      this.sendNotificationSummary(userId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  private async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await Notification.updateMany(
        { userId, read: false },
        { read: true, updatedAt: new Date() }
      );
      this.sendNotificationSummary(userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  private async getUserNotifications(userId: string, options: any = {}): Promise<any[]> {
    try {
      const { page = 1, limit = 20, unreadOnly = false, type, priority } = options;
      const skip = (page - 1) * limit;

      const query: any = { userId };
      if (unreadOnly) query.read = false;
      if (type) query.type = type;
      if (priority) query.priority = priority;

      return await Notification.find(query)
        .populate([
          { path: 'metadata.projectId', select: 'title' },
          { path: 'metadata.taskId', select: 'title' },
          { path: 'metadata.meetingId', select: 'title' }
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  private async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const user = await User.findById(userId).populate('profile');
      const profile = user?.profile as any;
      
      // Return default preferences if none set
      return profile?.notificationPreferences || {
        email: {
          taskAssigned: true,
          taskDue: true,
          projectUpdates: true,
          meetingReminders: true,
          feedbackResponse: true,
          systemAlerts: true
        },
        push: {
          taskAssigned: true,
          taskDue: true,
          projectUpdates: true,
          meetingReminders: true,
          feedbackResponse: true,
          systemAlerts: true
        },
        realTime: {
          enabled: true,
          sound: true,
          desktop: true
        }
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        email: {
          taskAssigned: true,
          taskDue: true,
          projectUpdates: true,
          meetingReminders: true,
          feedbackResponse: true,
          systemAlerts: true
        },
        push: {
          taskAssigned: true,
          taskDue: true,
          projectUpdates: true,
          meetingReminders: true,
          feedbackResponse: true,
          systemAlerts: true
        },
        realTime: {
          enabled: true,
          sound: true,
          desktop: true
        }
      };
    }
  }

  private async updateNotificationPreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    try {
      await Profile.findOneAndUpdate(
        { user: userId },
        { notificationPreferences: preferences },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  private startNotificationProcessing(): void {
    // Process scheduled notifications every minute
    setInterval(async () => {
      await this.processScheduledNotifications();
    }, 60000);

    // Clean up old notifications every hour
    setInterval(async () => {
      await this.cleanupOldNotifications();
    }, 3600000);
  }

  private async processScheduledNotifications(): Promise<void> {
    // This could be used for scheduled notifications like reminders
    // Implementation would depend on specific requirements
  }

  private async cleanupOldNotifications(): Promise<void> {
    try {
      // Delete notifications older than 30 days (handled by TTL index)
      // This is a backup cleanup in case TTL doesn't work as expected
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await Notification.deleteMany({ 
        createdAt: { $lt: thirtyDaysAgo },
        read: true 
      });
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }

  // Utility method to broadcast to all users
  async broadcastToAll(notificationData: Omit<NotificationData, 'userId'>): Promise<void> {
    try {
      // Get all users
      const users = await User.find({}).select('_id');
      const notification = {
        ...notificationData,
        userId: users.map(u => u._id.toString())
      };
      
      await this.sendNotification(notification);
    } catch (error) {
      console.error('Error broadcasting to all users:', error);
    }
  }

  // Utility method to broadcast to users with specific role
  async broadcastToRole(role: string, notificationData: Omit<NotificationData, 'userId'>): Promise<void> {
    try {
      const profiles = await Profile.find({ role }).populate('user');
      const userIds = profiles.map(p => (p.user as any)._id.toString());
      
      if (userIds.length > 0) {
        const notification = {
          ...notificationData,
          userId: userIds
        };
        
        await this.sendNotification(notification);
      }
    } catch (error) {
      console.error('Error broadcasting to role:', error);
    }
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get specific user's connection status
  getUserConnectionStatus(userId: string): { online: boolean; connections: number } {
    const connections = this.connectedUsers.get(userId) || [];
    return {
      online: connections.length > 0,
      connections: connections.length
    };
  }
}

export const notificationService = new NotificationService();
