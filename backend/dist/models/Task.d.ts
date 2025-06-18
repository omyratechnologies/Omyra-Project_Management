import mongoose from 'mongoose';
import { ITask } from '../types/index.js';
export declare const Task: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}> & ITask & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Task.d.ts.map