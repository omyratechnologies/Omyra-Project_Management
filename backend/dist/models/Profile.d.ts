import mongoose, { Document } from 'mongoose';
export interface IProfile extends Document {
    user: mongoose.Types.ObjectId;
    fullName: string;
    role: string;
    department?: string;
    permissions?: string[];
    bio?: string;
    avatar?: string;
    phone?: string;
    location?: string;
    preferences?: {
        notifications?: {
            emailNotifications?: boolean;
            taskAssignments?: boolean;
            projectUpdates?: boolean;
            dueDateReminders?: boolean;
            teamActivity?: boolean;
        };
        appearance?: {
            theme?: string;
            language?: string;
            timezone?: string;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Profile: mongoose.Model<IProfile, {}, {}, {}, mongoose.Document<unknown, {}, IProfile, {}> & IProfile & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Profile.d.ts.map