import mongoose from 'mongoose';
const confluencePageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['feature', 'documentation', 'process', 'meeting_notes'],
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [{
            type: String,
            trim: true
        }],
    isPublic: {
        type: Boolean,
        default: false
    },
    viewPermissions: [{
            type: String,
            enum: ['admin', 'project_manager', 'team_member', 'client']
        }],
    editPermissions: [{
            type: String,
            enum: ['admin', 'project_manager', 'team_member', 'client']
        }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        required: true
    },
    version: {
        type: Number,
        default: 1,
        required: true
    },
    parentPage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConfluencePage'
    }
}, {
    timestamps: true
});
confluencePageSchema.index({ project: 1, status: 1 });
confluencePageSchema.index({ createdBy: 1 });
confluencePageSchema.index({ assignedTo: 1 });
confluencePageSchema.index({ type: 1 });
confluencePageSchema.index({ tags: 1 });
confluencePageSchema.index({ isPublic: 1 });
export const ConfluencePage = mongoose.model('ConfluencePage', confluencePageSchema);
