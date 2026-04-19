import mongoose, { Schema, Document } from 'mongoose';

interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  tokens: number;
  plan: 'free' | 'starter' | 'pro';
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
      enum: ['free', 'starter', 'pro'],
      default: 'free',
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
