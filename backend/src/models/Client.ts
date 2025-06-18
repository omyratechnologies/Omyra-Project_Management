import mongoose from 'mongoose';
import { IClient } from '../types/index.js';

const clientSchema = new mongoose.Schema<IClient>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contactPerson: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  notes: {
    type: String,
    trim: true
  },
  billingInfo: {
    billingEmail: {
      type: String,
      lowercase: true,
      trim: true
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    paymentTerms: {
      type: String,
      enum: ['net-15', 'net-30', 'net-60', 'immediate'],
      default: 'net-30'
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
clientSchema.index({ 'contactPerson.email': 1 });
clientSchema.index({ companyName: 1 });
clientSchema.index({ status: 1 });

export const Client = mongoose.model<IClient>('Client', clientSchema);
