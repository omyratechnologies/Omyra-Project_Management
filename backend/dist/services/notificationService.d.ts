import { Server as HTTPServer } from 'http';
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
declare class NotificationService {
    private io;
    private connectedUsers;
    private notificationQueue;
    initialize(server: HTTPServer): void;
    private setupMiddleware;
    private setupEventHandlers;
    private addUserConnection;
    private removeUserConnection;
    private isUserOnline;
    sendNotification(notificationData: NotificationData): Promise<void>;
    private sendRealTimeNotification;
    private sendNotificationSummary;
    private queueNotification;
    private sendQueuedNotifications;
    private sendEmailNotification;
    private shouldSendEmailForType;
    private markNotificationAsRead;
    private markAllNotificationsAsRead;
    private getUserNotifications;
    private getNotificationPreferences;
    private updateNotificationPreferences;
    private startNotificationProcessing;
    private processScheduledNotifications;
    private cleanupOldNotifications;
    broadcastToAll(notificationData: Omit<NotificationData, 'userId'>): Promise<void>;
    broadcastToRole(role: string, notificationData: Omit<NotificationData, 'userId'>): Promise<void>;
    getConnectedUsersCount(): number;
    getUserConnectionStatus(userId: string): {
        online: boolean;
        connections: number;
    };
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notificationService.d.ts.map