import mongoose, { Document } from 'mongoose';
export interface IActivityLog extends Document {
    adminId: mongoose.Types.ObjectId;
    action: string;
    details: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ActivityLog: mongoose.Model<IActivityLog, {}, {}, {}, mongoose.Document<unknown, {}, IActivityLog, {}> & IActivityLog & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ActivityLog.d.ts.map