import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
export declare class NotificationController {
    static getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<{
        notifications: (import("mongoose").Document<unknown, {}, import("../models/Notification.js").INotification, {}> & import("../models/Notification.js").INotification & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            totalCount: number;
            totalPages: number;
        };
        unreadCount: number;
    }>, Record<string, any>> | undefined>;
    static getNotificationSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<{
        unreadCount: number;
        recentNotifications: (import("mongoose").Document<unknown, {}, import("../models/Notification.js").INotification, {}> & import("../models/Notification.js").INotification & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
    }>, Record<string, any>> | undefined>;
    static markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<{
        notification: import("mongoose").Document<unknown, {}, import("../models/Notification.js").INotification, {}> & import("../models/Notification.js").INotification & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>, Record<string, any>> | undefined>;
    static markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<{
        modifiedCount: number;
    }>, Record<string, any>> | undefined>;
    static deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<unknown>, Record<string, any>> | undefined>;
    static clearAllNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<{
        deletedCount: number;
    }>, Record<string, any>> | undefined>;
    static getNotificationPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<{
        preferences: any;
    }>, Record<string, any>> | undefined>;
    static updateNotificationPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<{
        preferences: any;
    }>, Record<string, any>> | undefined>;
    static sendTestNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<unknown>, Record<string, any>> | undefined>;
    static getNotificationStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<{
        totalNotifications: number;
        unreadNotifications: number;
        urgentNotifications: number;
        todayNotifications: number;
        connectedUsers: number;
    }>, Record<string, any>> | undefined>;
    static broadcastNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response<import("../utils/response.js").ApiResponse<unknown>, Record<string, any>> | undefined>;
}
//# sourceMappingURL=notificationController.d.ts.map