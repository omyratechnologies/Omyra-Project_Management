import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
        default: 'planning',
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Virtual field to populate members
projectSchema.virtual('members', {
    ref: 'ProjectMember',
    localField: '_id',
    foreignField: 'project',
    options: {
        populate: {
            path: 'user',
            select: '-password',
            populate: {
                path: 'profile',
                select: 'fullName email role'
            }
        }
    }
});
export const Project = mongoose.model('Project', projectSchema);
//# sourceMappingURL=Project.js.map