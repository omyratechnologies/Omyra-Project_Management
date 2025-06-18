import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'task_assigned' | 'task_due' | 'task_completed' | 'project_update' | 'project_milestone' | 'meeting_reminder' | 'feedback_response' | 'system_alert' | 'general';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    read: boolean;
    actionable: boolean;
    action?: string;
    link?: string;
    metadata?: {
        projectId?: mongoose.Types.ObjectId;
        taskId?: mongoose.Types.ObjectId;
        meetingId?: mongoose.Types.ObjectId;
        feedbackId?: mongoose.Types.ObjectId;
        entityId?: string;
        entityType?: string;
        [key: string]: any;
    };
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}> & INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map