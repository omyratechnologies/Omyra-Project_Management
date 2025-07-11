import mongoose from 'mongoose';
const projectMemberSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roleInProject: {
        type: String,
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
projectMemberSchema.index({ project: 1, user: 1 }, { unique: true });
export const ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);
