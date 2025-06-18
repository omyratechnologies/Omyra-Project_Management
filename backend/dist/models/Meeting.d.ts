import mongoose from 'mongoose';
import { IMeeting } from '../types/index.js';
export declare const Meeting: mongoose.Model<IMeeting, {}, {}, {}, mongoose.Document<unknown, {}, IMeeting, {}> & IMeeting & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Meeting.d.ts.map