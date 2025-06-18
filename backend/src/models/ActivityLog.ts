import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  details: any;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);