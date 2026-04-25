import mongoose, { Schema, Document } from 'mongoose';
import type { PlanName } from '../types/transaction';
import { PLAN_NAMES } from '../utils/constants';

interface TransactionDocument extends Document {
  userId: string;
  amount: number;
  tokensAdded: number;
  plan: PlanName;
  paymentId: string;
  status: 'pending' | 'success' | 'failed';
  createdAt?: Date;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    tokensAdded: {
      type: Number,
      required: true,
    },
    plan: {
      type: String,
      enum: [...PLAN_NAMES],
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = mongoose.model<TransactionDocument>(
  'Transaction',
  transactionSchema
);
