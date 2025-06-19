import mongoose, { Schema } from 'mongoose';
const activityLogSchema = new Schema({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true
});
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
