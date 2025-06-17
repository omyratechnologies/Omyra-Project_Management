import mongoose from 'mongoose';
import { IProfile, UserRole } from '../types/index.js';

const profileSchema = new mongoose.Schema<IProfile>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'project_manager', 'team_member'],
    default: 'team_member',
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  preferences: {
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      taskAssignments: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: true },
      dueDateReminders: { type: Boolean, default: true },
      teamActivity: { type: Boolean, default: false }
    },
    appearance: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'est' }
    }
  }
}, {
  timestamps: true
});

export const Profile = mongoose.model<IProfile>('Profile', profileSchema);
