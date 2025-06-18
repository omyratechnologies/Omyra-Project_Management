import mongoose from 'mongoose';
const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendees: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    locationUrl: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});
// Index for efficient queries
meetingSchema.index({ project: 1, scheduledAt: 1 });
meetingSchema.index({ attendees: 1, scheduledAt: 1 });
meetingSchema.index({ organizer: 1, scheduledAt: 1 });
export const Meeting = mongoose.model('Meeting', meetingSchema);
//# sourceMappingURL=Meeting.js.map