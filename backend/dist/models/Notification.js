import mongoose, { Schema } from 'mongoose';
const NotificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['task_assigned', 'task_due', 'task_completed', 'project_update', 'project_milestone', 'meeting_reminder', 'feedback_response', 'system_alert', 'general'],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    actionable: {
        type: Boolean,
        default: false
    },
    action: {
        type: String,
        maxlength: 100
    },
    link: {
        type: String,
        maxlength: 500
    },
    metadata: {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        },
        taskId: {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        },
        meetingId: {
            type: Schema.Types.ObjectId,
            ref: 'Meeting'
        },
        feedbackId: {
            type: Schema.Types.ObjectId,
            ref: 'ClientFeedback'
        },
        entityId: String,
        entityType: String,
        additionalData: Schema.Types.Mixed
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        index: { expireAfterSeconds: 0 }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, priority: 1, createdAt: -1 });
NotificationSchema.virtual('isRecent').get(function () {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.createdAt > oneDayAgo;
});
NotificationSchema.methods.markAsRead = function () {
    this.read = true;
    return this.save();
};
NotificationSchema.statics.createNotification = async function (notificationData) {
    const notification = new this(notificationData);
    await notification.save();
    return notification.populate([
        { path: 'metadata.projectId', select: 'title' },
        { path: 'metadata.taskId', select: 'title' },
        { path: 'metadata.meetingId', select: 'title' }
    ]);
};
NotificationSchema.statics.getUserNotifications = async function (userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false, type, priority } = options;
    const skip = (page - 1) * limit;
    const query = { userId };
    if (unreadOnly)
        query.read = false;
    if (type)
        query.type = type;
    if (priority)
        query.priority = priority;
    return this.find(query)
        .populate([
        { path: 'metadata.projectId', select: 'title' },
        { path: 'metadata.taskId', select: 'title' },
        { path: 'metadata.meetingId', select: 'title' }
    ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};
NotificationSchema.statics.markAllAsRead = async function (userId) {
    return this.updateMany({ userId, read: false }, { read: true, updatedAt: new Date() });
};
NotificationSchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ userId, read: false });
};
NotificationSchema.pre('save', function (next) {
    if (this.isNew && !this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
});
export const Notification = mongoose.model('Notification', NotificationSchema);
