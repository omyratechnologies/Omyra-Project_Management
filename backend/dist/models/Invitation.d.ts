import mongoose from 'mongoose';
export interface IInvitation extends mongoose.Document {
    email: string;
    inviteeName: string;
    inviterName: string;
    inviterId: string;
    organizationName?: string;
    role: 'admin' | 'project_manager' | 'team_member';
    token: string;
    status: 'pending' | 'accepted' | 'expired';
    projectId?: string;
    expiresAt: Date;
    createdAt: Date;
    acceptedAt?: Date;
}
export declare const Invitation: mongoose.Model<IInvitation, {}, {}, {}, mongoose.Document<unknown, {}, IInvitation, {}> & IInvitation & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Invitation.d.ts.map