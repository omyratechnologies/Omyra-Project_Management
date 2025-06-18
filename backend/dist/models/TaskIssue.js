import mongoose from 'mongoose';
const taskIssueSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    type: {
        type: String,
        enum: ['bug', 'blocker', 'clarification', 'resource_needed', 'other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolution: {
        type: String,
        trim: true
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Indexes for efficient queries
taskIssueSchema.index({ task: 1, status: 1 });
taskIssueSchema.index({ reportedBy: 1 });
taskIssueSchema.index({ assignedTo: 1 });
export const TaskIssue = mongoose.model('TaskIssue', taskIssueSchema);
//# sourceMappingURL=TaskIssue.js.map