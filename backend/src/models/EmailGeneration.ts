import mongoose, { Schema, Document } from 'mongoose';
import { EmailGenerationInput } from '../types/index';

interface EmailGenerationDocument extends Document {
  userId: string;
  inputParams: EmailGenerationInput;
  generatedOutput: {
    emails: Array<{ subject: string; body: string; variation: number }>;
    sequence?: Array<{ day: number; subject: string; body: string }>;
  };
  tokensUsed: number;
  provider: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const emailGenerationSchema = new Schema<EmailGenerationDocument>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    inputParams: {
      senderName: String,
      senderRole: String,
      senderCompany: String,
      senderWebsite: String,
      productDescription: String,
      targetIndustry: String,
      targetRole: String,
      companySize: String,
      geography: String,
      painPoints: [String],
      valueProposition: String,
      usp: String,
      tone: {
        type: String,
        enum: ['professional', 'casual', 'persuasive', 'friendly'],
      },
      length: {
        type: String,
        enum: ['short', 'medium', 'long'],
      },
      emailType: {
        type: String,
        enum: ['cold_outreach', 'follow_up', 'sales_pitch', 'partnership', 'job_inquiry'],
      },
      ctaType: {
        type: String,
        enum: ['book_call', 'reply', 'demo_request', 'other'],
      },
      variations: Number,
      generateSequence: Boolean,
    },
    generatedOutput: {
      emails: [
        {
          subject: String,
          body: String,
          variation: Number,
        },
      ],
      sequence: [
        {
          day: Number,
          subject: String,
          body: String,
        },
      ],
    },
    tokensUsed: {
      type: Number,
      default: 1,
    },
    provider: {
      type: String,
      default: 'openai',
      enum: ['openai', 'mock'],
    },
  },
  {
    timestamps: true,
  }
);

export const EmailGenerationModel = mongoose.model<EmailGenerationDocument>(
  'EmailGeneration',
  emailGenerationSchema
);
