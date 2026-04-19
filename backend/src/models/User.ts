import mongoose, { Schema, Document } from 'mongoose';

interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  tokens: number;
  plan: 'free' | 'starter' | 'pro';
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
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
