import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { User, Profile, Notification } from '../models/index.js';
import { emailService } from './emailService.js';
class NotificationService {
    io = null;
    connectedUsers = new Map();
    notificationQueue = new Map();
    initialize(server) {
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
    setupMiddleware() {
        if (!this.io)
            return;
        this.io.use(async (socket, next) => {
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
                const decoded = jwt.verify(token, config.jwtSecret);
                const user = await User.findById(decoded.id).populate('profile');
                if (!user || !user.profile) {
                    console.error('🔐 Invalid user or profile not found:', decoded.id);
                    return next(new Error('Invalid user'));
                }
                console.log('🔐 Socket authentication successful:', { userId: user.id, role: user.profile.role });
                socket.userId = user.id;
                socket.userRole = user.profile.role;
                next();
            }
            catch (error) {
                console.error('🔐 Socket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }
    setupEventHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            console.log(`🔌 User ${socket.userId} connected (${socket.id})`);
            if (socket.userId) {
                this.addUserConnection(socket.userId, socket.id);
                this.sendQueuedNotifications(socket.userId);
                this.sendNotificationSummary(socket.userId);
            }
            socket.on('mark_notification_read', async (notificationId) => {
                if (socket.userId) {
                    await this.markNotificationAsRead(socket.userId, notificationId);
                }
            });
            socket.on('mark_all_notifications_read', async () => {
                if (socket.userId) {
                    await this.markAllNotificationsAsRead(socket.userId);
                }
            });
            socket.on('get_notifications', async (options) => {
                if (socket.userId) {
                    const notifications = await this.getUserNotifications(socket.userId, options);
                    socket.emit('notifications_list', notifications);
                }
            });
            socket.on('update_notification_preferences', async (preferences) => {
                if (socket.userId) {
                    await this.updateNotificationPreferences(socket.userId, preferences);
                    socket.emit('preferences_updated', { success: true });
                }
            });
            socket.on('disconnect', () => {
                console.log(`🔌 User ${socket.userId} disconnected (${socket.id})`);
                if (socket.userId) {
                    this.removeUserConnection(socket.userId, socket.id);
                }
            });
            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        });
    }
    addUserConnection(userId, socketId) {
        const userSockets = this.connectedUsers.get(userId) || [];
        userSockets.push(socketId);
        this.connectedUsers.set(userId, userSockets);
    }
    removeUserConnection(userId, socketId) {
        const userSockets = this.connectedUsers.get(userId) || [];
        const filteredSockets = userSockets.filter(id => id !== socketId);
        if (filteredSockets.length > 0) {
            this.connectedUsers.set(userId, filteredSockets);
        }
        else {
            this.connectedUsers.delete(userId);
        }
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
    async sendNotification(notificationData) {
        try {
            const userIds = Array.isArray(notificationData.userId)
                ? notificationData.userId
                : [notificationData.userId];
            for (const userId of userIds) {
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
                if (this.isUserOnline(userId)) {
                    await this.sendRealTimeNotification(userId, notification);
                }
                else {
                    this.queueNotification(userId, notificationData);
                }
                if (notificationData.emailNotification !== false) {
                    await this.sendEmailNotification(userId, notification);
                }
                console.log(`🔔 Notification sent to user ${userId}: ${notificationData.title}`);
            }
        }
        catch (error) {
            console.error('Error sending notification:', error);
        }
    }
    async sendRealTimeNotification(userId, notification) {
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
        this.sendNotificationSummary(userId);
    }
    async sendNotificationSummary(userId) {
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
    queueNotification(userId, notificationData) {
        const userQueue = this.notificationQueue.get(userId) || [];
        userQueue.push(notificationData);
        this.notificationQueue.set(userId, userQueue);
    }
    async sendQueuedNotifications(userId) {
        const queuedNotifications = this.notificationQueue.get(userId) || [];
        if (queuedNotifications.length === 0)
            return;
        for (const notificationData of queuedNotifications) {
            const notification = await Notification.findOne({
                userId,
                title: notificationData.title,
                message: notificationData.message
            }).sort({ createdAt: -1 });
            if (notification) {
                await this.sendRealTimeNotification(userId, notification);
            }
        }
        this.notificationQueue.delete(userId);
    }
    async sendEmailNotification(userId, notification) {
        try {
            const user = await User.findById(userId).populate('profile');
            if (!user || !user.email)
                return;
            const preferences = await this.getNotificationPreferences(userId);
            const emailEnabled = this.shouldSendEmailForType(notification.type, preferences);
            if (!emailEnabled)
                return;
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
        }
        catch (error) {
            console.error('Error sending email notification:', error);
        }
    }
    shouldSendEmailForType(type, preferences) {
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
    async markNotificationAsRead(userId, notificationId) {
        try {
            await Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true, updatedAt: new Date() });
            this.sendNotificationSummary(userId);
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    async markAllNotificationsAsRead(userId) {
        try {
            await Notification.updateMany({ userId, read: false }, { read: true, updatedAt: new Date() });
            this.sendNotificationSummary(userId);
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
    async getUserNotifications(userId, options = {}) {
        try {
            const { page = 1, limit = 20, unreadOnly = false, type, priority } = options;
            const skip = (page - 1) * limit;
            const query = { userId };
            if (unreadOnly)
                query.read = false;
            if (type)
                query.type = type;
            if (priority)
                query.priority = priority;
            return await Notification.find(query)
                .populate([
                { path: 'metadata.projectId', select: 'title' },
                { path: 'metadata.taskId', select: 'title' },
                { path: 'metadata.meetingId', select: 'title' }
            ])
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
        }
        catch (error) {
            console.error('Error getting user notifications:', error);
            return [];
        }
    }
    async getNotificationPreferences(userId) {
        try {
            const user = await User.findById(userId).populate('profile');
            const profile = user?.profile;
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
        }
        catch (error) {
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
    async updateNotificationPreferences(userId, preferences) {
        try {
            await Profile.findOneAndUpdate({ user: userId }, { notificationPreferences: preferences }, { new: true });
        }
        catch (error) {
            console.error('Error updating notification preferences:', error);
        }
    }
    startNotificationProcessing() {
        setInterval(async () => {
            await this.processScheduledNotifications();
        }, 60000);
        setInterval(async () => {
            await this.cleanupOldNotifications();
        }, 3600000);
    }
    async processScheduledNotifications() {
    }
    async cleanupOldNotifications() {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            await Notification.deleteMany({
                createdAt: { $lt: thirtyDaysAgo },
                read: true
            });
        }
        catch (error) {
            console.error('Error cleaning up old notifications:', error);
        }
    }
    async broadcastToAll(notificationData) {
        try {
            const users = await User.find({}).select('_id');
            const notification = {
                ...notificationData,
                userId: users.map(u => u._id.toString())
            };
            await this.sendNotification(notification);
        }
        catch (error) {
            console.error('Error broadcasting to all users:', error);
        }
    }
    async broadcastToRole(role, notificationData) {
        try {
            const profiles = await Profile.find({ role }).populate('user');
            const userIds = profiles.map(p => p.user._id.toString());
            if (userIds.length > 0) {
                const notification = {
                    ...notificationData,
                    userId: userIds
                };
                await this.sendNotification(notification);
            }
        }
        catch (error) {
            console.error('Error broadcasting to role:', error);
        }
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    getUserConnectionStatus(userId) {
        const connections = this.connectedUsers.get(userId) || [];
        return {
            online: connections.length > 0,
            connections: connections.length
        };
    }
}
export const notificationService = new NotificationService();
