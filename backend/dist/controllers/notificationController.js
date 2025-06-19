import { Notification } from '../models/Notification.js';
import { notificationService } from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { Profile } from '../models/index.js';
export class NotificationController {
    static async getNotifications(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const { page = 1, limit = 20, unreadOnly = false, type, priority } = req.query;
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                unreadOnly: unreadOnly === 'true',
                type: type,
                priority: priority
            };
            const notifications = await Notification.find({
                userId: req.user.id,
                ...(options.unreadOnly && { read: false }),
                ...(options.type && { type: options.type }),
                ...(options.priority && { priority: options.priority })
            })
                .populate([
                { path: 'metadata.projectId', select: 'title' },
                { path: 'metadata.taskId', select: 'title' },
                { path: 'metadata.meetingId', select: 'title' }
            ])
                .sort({ createdAt: -1 })
                .skip((options.page - 1) * options.limit)
                .limit(options.limit);
            const totalCount = await Notification.countDocuments({
                userId: req.user.id,
                ...(options.unreadOnly && { read: false }),
                ...(options.type && { type: options.type }),
                ...(options.priority && { priority: options.priority })
            });
            const unreadCount = await Notification.countDocuments({
                userId: req.user.id,
                read: false
            });
            return successResponse(res, 'Notifications retrieved successfully', {
                notifications,
                pagination: {
                    page: options.page,
                    limit: options.limit,
                    totalCount,
                    totalPages: Math.ceil(totalCount / options.limit)
                },
                unreadCount
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getNotificationSummary(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const unreadCount = await Notification.countDocuments({
                userId: req.user.id,
                read: false
            });
            const recentNotifications = await Notification.find({
                userId: req.user.id,
                read: false
            })
                .populate([
                { path: 'metadata.projectId', select: 'title' },
                { path: 'metadata.taskId', select: 'title' }
            ])
                .sort({ createdAt: -1 })
                .limit(5);
            return successResponse(res, 'Notification summary retrieved successfully', {
                unreadCount,
                recentNotifications
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const { notificationId } = req.params;
            const notification = await Notification.findOneAndUpdate({ _id: notificationId, userId: req.user.id }, { read: true, updatedAt: new Date() }, { new: true });
            if (!notification) {
                return errorResponse(res, 'Notification not found', undefined, 404);
            }
            return successResponse(res, 'Notification marked as read', { notification });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const result = await Notification.updateMany({ userId: req.user.id, read: false }, { read: true, updatedAt: new Date() });
            return successResponse(res, 'All notifications marked as read', {
                modifiedCount: result.modifiedCount
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteNotification(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const { notificationId } = req.params;
            const notification = await Notification.findOneAndDelete({
                _id: notificationId,
                userId: req.user.id
            });
            if (!notification) {
                return errorResponse(res, 'Notification not found', undefined, 404);
            }
            return successResponse(res, 'Notification deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async clearAllNotifications(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const result = await Notification.deleteMany({ userId: req.user.id });
            return successResponse(res, 'All notifications cleared', {
                deletedCount: result.deletedCount
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getNotificationPreferences(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const profile = await Profile.findOne({ user: req.user.id });
            const defaultPreferences = {
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
            const preferences = profile?.notificationPreferences || defaultPreferences;
            return successResponse(res, 'Notification preferences retrieved successfully', {
                preferences
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateNotificationPreferences(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const { preferences } = req.body;
            if (!preferences) {
                return errorResponse(res, 'Preferences are required', undefined, 400);
            }
            const profile = await Profile.findOneAndUpdate({ user: req.user.id }, { notificationPreferences: preferences }, { new: true });
            if (!profile) {
                return errorResponse(res, 'Profile not found', undefined, 404);
            }
            return successResponse(res, 'Notification preferences updated successfully', {
                preferences: profile.notificationPreferences
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendTestNotification(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const profile = await Profile.findOne({ user: req.user.id });
            if (!profile || profile.role !== 'admin') {
                return errorResponse(res, 'Access denied. Only administrators can send test notifications.', undefined, 403);
            }
            await notificationService.sendNotification({
                userId: req.user.id,
                type: 'general',
                title: 'Test Notification',
                message: 'This is a test notification to verify the real-time notification system is working correctly.',
                priority: 'medium',
                actionable: true,
                action: 'View Dashboard',
                link: '/dashboard'
            });
            return successResponse(res, 'Test notification sent successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getNotificationStats(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const profile = await Profile.findOne({ user: req.user.id });
            if (!profile || profile.role !== 'admin') {
                return errorResponse(res, 'Access denied. Only administrators can view notification statistics.', undefined, 403);
            }
            const stats = await Promise.all([
                Notification.countDocuments(),
                Notification.countDocuments({ read: false }),
                Notification.countDocuments({ priority: 'urgent' }),
                Notification.countDocuments({
                    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                })
            ]);
            const connectedUsers = notificationService.getConnectedUsersCount();
            return successResponse(res, 'Notification statistics retrieved successfully', {
                totalNotifications: stats[0],
                unreadNotifications: stats[1],
                urgentNotifications: stats[2],
                todayNotifications: stats[3],
                connectedUsers
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async broadcastNotification(req, res, next) {
        try {
            if (!req.user) {
                return errorResponse(res, 'User not authenticated', undefined, 401);
            }
            const profile = await Profile.findOne({ user: req.user.id });
            if (!profile || profile.role !== 'admin') {
                return errorResponse(res, 'Access denied. Only administrators can broadcast notifications.', undefined, 403);
            }
            const { type, title, message, priority, actionable, action, link } = req.body;
            if (!type || !title || !message) {
                return errorResponse(res, 'Type, title, and message are required', undefined, 400);
            }
            await notificationService.broadcastToAll({
                type,
                title,
                message,
                priority: priority || 'medium',
                actionable: actionable || false,
                action,
                link
            });
            return successResponse(res, 'Notification broadcasted successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
