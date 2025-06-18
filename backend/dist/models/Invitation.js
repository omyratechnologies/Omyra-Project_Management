import mongoose from 'mongoose';
const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    inviteeName: {
        type: String,
        required: true,
        trim: true
    },
    inviterName: {
        type: String,
        required: true,
        trim: true
    },
    inviterId: {
        type: String,
        required: true
    },
    organizationName: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'project_manager', 'team_member'],
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    projectId: {
        type: String
    },
    expiresAt: {
        type: Date,
        required: true
    },
    acceptedAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Index for efficient queries
invitationSchema.index({ token: 1 });
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Invitation = mongoose.model('Invitation', invitationSchema);
//# sourceMappingURL=Invitation.js.map