import mongoose, { Schema, Document } from 'mongoose';

interface OtpTokenDocument extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
}

const otpTokenSchema = new Schema<OtpTokenDocument>({
  email: { type: String, required: true, lowercase: true, trim: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
});

// Auto-delete expired documents
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpTokenModel = mongoose.model<OtpTokenDocument>('OtpToken', otpTokenSchema);
