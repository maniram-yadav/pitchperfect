import mongoose, { Schema, Document } from 'mongoose';
import type { PlanName } from '../types/transaction';
import { PLAN_NAMES } from '../utils/constants';

interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  tokens: number;
  plan: PlanName;
  emailVerified: boolean;
  emailVerificationToken?: string;
  profile?: {
    role?: string;
    company?: string;
    website?: string;
    productDescription?: string;
    valueProposition?: string;
    usp?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    tokens: {
      type: Number,
      default: 10, // Free plan tokens
    },
    plan: {
      type: String,
      enum: [...PLAN_NAMES],
      default: 'free',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    profile: {
      role: String,
      company: String,
      website: String,
      productDescription: String,
      valueProposition: String,
      usp: String,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
