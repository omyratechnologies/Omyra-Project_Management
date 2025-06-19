import mongoose, { Schema } from 'mongoose';
const profileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'project_manager', 'team_member', 'client']
    },
    department: {
        type: String
    },
    permissions: [{
            type: String
        }],
    bio: {
        type: String
    },
    avatar: {
        type: String
    },
    phone: {
        type: String
    },
    location: {
        type: String
    },
    preferences: {
        notifications: {
            emailNotifications: { type: Boolean, default: true },
            taskAssignments: { type: Boolean, default: true },
            projectUpdates: { type: Boolean, default: true },
            dueDateReminders: { type: Boolean, default: true },
            teamActivity: { type: Boolean, default: false }
        },
        appearance: {
            theme: { type: String, default: 'light' },
            language: { type: String, default: 'en' },
            timezone: { type: String, default: 'est' }
        }
    },
    notificationPreferences: {
        email: {
            taskAssigned: { type: Boolean, default: true },
            taskDue: { type: Boolean, default: true },
            projectUpdates: { type: Boolean, default: true },
            meetingReminders: { type: Boolean, default: true },
            feedbackResponse: { type: Boolean, default: true },
            systemAlerts: { type: Boolean, default: true }
        },
        push: {
            taskAssigned: { type: Boolean, default: true },
            taskDue: { type: Boolean, default: true },
            projectUpdates: { type: Boolean, default: true },
            meetingReminders: { type: Boolean, default: true },
            feedbackResponse: { type: Boolean, default: true },
            systemAlerts: { type: Boolean, default: true }
        },
        realTime: {
            enabled: { type: Boolean, default: true },
            sound: { type: Boolean, default: true },
            desktop: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true
});
export const Profile = mongoose.model('Profile', profileSchema);
