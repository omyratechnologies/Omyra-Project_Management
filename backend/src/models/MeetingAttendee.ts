import mongoose from 'mongoose';
import { IMeetingAttendee } from '../types/index.js';

const meetingAttendeeSchema = new mongoose.Schema<IMeetingAttendee>({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['attending', 'not_attending', 'tentative'],
    default: 'tentative',
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  joinedAt: {
    type: Date
  },
  leftAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure one record per user per meeting
meetingAttendeeSchema.index({ meeting: 1, user: 1 }, { unique: true });

export const MeetingAttendee = mongoose.model<IMeetingAttendee>('MeetingAttendee', meetingAttendeeSchema);
