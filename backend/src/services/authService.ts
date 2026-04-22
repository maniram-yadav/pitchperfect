import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { UserModel } from '../models/User';
import { OtpTokenModel } from '../models/OtpToken';
import { hashPassword, verifyPassword } from '../utils/security';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { ApiResponse } from '../types/index';
import { logger } from '../utils/logger';
import { notificationService } from './notificationService';
import { config } from '../config/env';

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

export const authService = {
  async signup(name: string, email: string, password: string): Promise<ApiResponse<any>> {
    logger.debug('authService.signup', { email });
    try {
      const existingUser = await UserModel.findOne({ email });

      if (existingUser) {
        logger.warn('Signup — user already exists', { email });
        return { success: false, message: 'User already exists', error: 'User with this email already registered' };
      }

      const passwordHash = await hashPassword(password);
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const newUser = new UserModel({ name, email, passwordHash, tokens: 10, plan: 'free', emailVerified: false, emailVerificationToken });
      await newUser.save();
      logger.info('Signup — user created', { userId: newUser._id.toString(), email });

      const verificationLink = `${config.frontendUrl}/verify-email?token=${emailVerificationToken}`;
      await notificationService.sendVerificationEmail(newUser.name, newUser.email, verificationLink);

      return {
        success: true,
        message: 'Account created! Please check your email and click the verification link to activate your account.',
        data: {
          email: newUser.email,
          name: newUser.name,
        },
      };
    } catch (error) {
      logger.error('authService.signup error', { email, error });
      return { success: false, message: 'Signup failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async login(email: string, password: string): Promise<ApiResponse<any>> {
    logger.debug('authService.login', { email });
    try {
      const user = await UserModel.findOne({ email });

      if (!user) {
        logger.warn('Login — user not found', { email });
        return { success: false, message: 'Invalid credentials', error: 'User not found' };
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        logger.warn('Login — incorrect password', { email });
        return { success: false, message: 'Invalid credentials', error: 'Incorrect password' };
      }

      if (!user.emailVerified) {
        logger.warn('Login — email not verified', { email });
        return { success: false, message: 'Email not verified. Please check your inbox and click the verification link we sent you before logging in.', error: 'EMAIL_NOT_VERIFIED' };
      }

      logger.info('Login — success', { userId: user._id.toString(), email });
      const token = generateToken(user._id.toString(), user.email);
      const refreshToken = generateRefreshToken(user._id.toString(), user.email);

      return {
        success: true,
        message: 'Login successful',
        data: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          tokens: user.tokens,
          plan: user.plan,
          token,
          refreshToken,
        },
      };
    } catch (error) {
      logger.error('authService.login error', { email, error });
      return { success: false, message: 'Login failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async resendVerification(email: string): Promise<ApiResponse<null>> {
    logger.debug('authService.resendVerification', { email });
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Silent — don't reveal whether email exists
        return { success: true, message: 'If that account exists and is unverified, a new link has been sent.' };
      }

      if (user.emailVerified) {
        return { success: false, message: 'This email is already verified. You can log in.' };
      }

      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = emailVerificationToken;
      await user.save();

      const verificationLink = `${config.frontendUrl}/verify-email?token=${emailVerificationToken}`;
      await notificationService.sendVerificationEmail(user.name, user.email, verificationLink);

      logger.info('Verification email resent', { email });
      return { success: true, message: 'Verification email sent. Please check your inbox.' };
    } catch (error) {
      logger.error('authService.resendVerification error', { email, error });
      return { success: false, message: 'Failed to resend verification email', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    logger.debug('authService.verifyEmail', { token: token.slice(0, 8) + '...' });
    try {
      const user = await UserModel.findOne({ emailVerificationToken: token });

      if (!user) {
        return { success: false, message: 'Invalid or expired verification link.' };
      }

      if (user.emailVerified) {
        return { success: true, message: 'Email already verified. You can log in.' };
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      logger.info('Email verified', { userId: user._id.toString(), email: user.email });
      await notificationService.sendWelcomeEmail(user.name, user.email);

      return { success: true, message: 'Email verified successfully! You can now log in.' };
    } catch (error) {
      logger.error('authService.verifyEmail error', { error });
      return { success: false, message: 'Verification failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async getUserProfile(userId: string): Promise<ApiResponse<any>> {
    logger.debug('authService.getUserProfile', { userId });
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        logger.warn('getUserProfile — user not found', { userId });
        return { success: false, message: 'User not found' };
      }

      logger.debug('getUserProfile — success', { userId });
      return {
        success: true,
        message: 'User profile retrieved',
        data: {
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          tokens: user.tokens,
          plan: user.plan,
          profile: user.profile || {},
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      logger.error('authService.getUserProfile error', { userId, error });
      return { success: false, message: 'Failed to fetch profile', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async updateProfile(userId: string, profile: Record<string, string>): Promise<ApiResponse<any>> {
    logger.debug('authService.updateProfile', { userId });
    try {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { profile } },
        { new: true }
      );

      if (!user) {
        logger.warn('updateProfile — user not found', { userId });
        return { success: false, message: 'User not found' };
      }

      logger.info('updateProfile — success', { userId });
      return { success: true, message: 'Profile updated successfully', data: { profile: user.profile } };
    } catch (error) {
      logger.error('authService.updateProfile error', { userId, error });
      return { success: false, message: 'Failed to update profile', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

export const passwordResetService = {
  async requestReset(email: string): Promise<ApiResponse<null>> {
    logger.debug('passwordResetService.requestReset', { email });
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() });

      // Always return success to avoid user enumeration
      if (!user) {
        logger.warn('Password reset — email not found (silent)', { email });
        return { success: true, message: 'If that email exists, an OTP has been sent.' };
      }

      logger.info('Password reset — user found, creating OTP', { email });
      // Delete any existing OTP for this email
      await OtpTokenModel.deleteMany({ email: email.toLowerCase() });

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpHash = await bcryptjs.hash(otp, 10);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await OtpTokenModel.create({ email: email.toLowerCase(), otpHash, expiresAt });
      logger.info('Password reset OTP created', { email, expiresAt });
      await notificationService.sendOtpEmail(email, otp);
      logger.info('Password reset OTP created and sent', { email });

      return { success: true, message: 'If that email exists, an OTP has been sent.' };
    } catch (error) {
      logger.error('passwordResetService.requestReset error', { email, error });
      return { success: false, message: 'Failed to send OTP', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse<null>> {
    logger.debug('passwordResetService.resetPassword', { email });
    try {
      const record = await OtpTokenModel.findOne({ email: email.toLowerCase() });

      if (!record) {
        return { success: false, message: 'OTP not found or expired. Please request a new one.' };
      }

      if (record.attempts >= MAX_OTP_ATTEMPTS) {
        await OtpTokenModel.deleteOne({ _id: record._id });
        return { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
      }

      if (new Date() > record.expiresAt) {
        await OtpTokenModel.deleteOne({ _id: record._id });
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      const isValid = await bcryptjs.compare(otp, record.otpHash);

      if (!isValid) {
        await OtpTokenModel.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
        const remaining = MAX_OTP_ATTEMPTS - record.attempts - 1;
        return { success: false, message: `Invalid OTP. ${remaining} attempt(s) remaining.` };
      }

      const passwordHash = await hashPassword(newPassword);
      await UserModel.updateOne({ email: email.toLowerCase() }, { passwordHash });
      await OtpTokenModel.deleteOne({ _id: record._id });

      logger.info('Password reset successful', { email });
      return { success: true, message: 'Password reset successfully. You can now log in.' };
    } catch (error) {
      logger.error('passwordResetService.resetPassword error', { email, error });
      return { success: false, message: 'Password reset failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

export const tokenService = {
  async getUserTokens(userId: string): Promise<ApiResponse<number>> {
    logger.debug('tokenService.getUserTokens', { userId });
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        logger.warn('getUserTokens — user not found', { userId });
        return { success: false, message: 'User not found' };
      }

      return { success: true, message: 'Token balance retrieved', data: user.tokens };
    } catch (error) {
      logger.error('tokenService.getUserTokens error', { userId, error });
      return { success: false, message: 'Failed to fetch tokens', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async deductTokens(userId: string, tokensToDeduct: number): Promise<ApiResponse<number>> {
    logger.debug('tokenService.deductTokens', { userId, tokensToDeduct });
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        logger.warn('deductTokens — user not found', { userId });
        return { success: false, message: 'User not found' };
      }

      if (user.tokens < tokensToDeduct) {
        logger.warn('deductTokens — insufficient tokens', { userId, have: user.tokens, need: tokensToDeduct });
        return { success: false, message: 'Insufficient tokens', error: `Need ${tokensToDeduct} tokens but only have ${user.tokens}` };
      }

      user.tokens -= tokensToDeduct;
      await user.save();
      logger.info('deductTokens — success', { userId, remaining: user.tokens });
      return { success: true, message: 'Tokens deducted successfully', data: user.tokens };
    } catch (error) {
      logger.error('tokenService.deductTokens error', { userId, error });
      return { success: false, message: 'Failed to deduct tokens', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async addTokens(userId: string, tokensToAdd: number): Promise<ApiResponse<number>> {
    logger.debug('tokenService.addTokens', { userId, tokensToAdd });
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        logger.warn('addTokens — user not found', { userId });
        return { success: false, message: 'User not found' };
      }

      user.tokens += tokensToAdd;
      await user.save();
      logger.info('addTokens — success', { userId, total: user.tokens });
      return { success: true, message: 'Tokens added successfully', data: user.tokens };
    } catch (error) {
      logger.error('tokenService.addTokens error', { userId, error });
      return { success: false, message: 'Failed to add tokens', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};
