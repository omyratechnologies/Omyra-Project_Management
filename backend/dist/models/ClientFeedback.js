import mongoose from 'mongoose';
const clientFeedbackSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'feature_request', 'bug_report', 'improvement'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'under_review', 'in_progress', 'resolved', 'closed'],
        default: 'open',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    response: {
        type: String,
        trim: true
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Indexes for efficient queries
clientFeedbackSchema.index({ project: 1, status: 1 });
clientFeedbackSchema.index({ client: 1 });
clientFeedbackSchema.index({ assignedTo: 1 });
export const ClientFeedback = mongoose.model('ClientFeedback', clientFeedbackSchema);
//# sourceMappingURL=ClientFeedback.js.map