import nodemailer, { Transporter } from 'nodemailer';
import { google } from 'googleapis';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const createSmtpTransporter = (): Transporter =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmail.user,
      pass: config.gmail.appPassword,
    },
  });

const createOAuth2Transporter = async (): Promise<Transporter> => {
  const oauth2Client = new google.auth.OAuth2(
    config.gmail.clientId,
    config.gmail.clientSecret,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: config.gmail.refreshToken });

  const { token: accessToken } = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.gmail.user,
      clientId: config.gmail.clientId,
      clientSecret: config.gmail.clientSecret,
      refreshToken: config.gmail.refreshToken,
      accessToken: accessToken as string,
    },
  });
};

const getTransporter = async (): Promise<Transporter> => {
  if (config.gmail.strategy === 'oauth2') {
    return createOAuth2Transporter();
  }
  return createSmtpTransporter();
};

const isConfigured = (): boolean => {
  if (!config.gmail.user) return false;
  if (config.gmail.strategy === 'oauth2') {
    return !!(config.gmail.clientId && config.gmail.clientSecret && config.gmail.refreshToken);
  }
  return !!config.gmail.appPassword;
};

const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  const transporter = await getTransporter();
  await transporter.sendMail({
    from: `"PitchPerfect" <${config.gmail.user}>`,
    to,
    subject,
    html,
  });
};

export const notificationService = {
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    if (!isConfigured()) {
      logger.warn('Email not configured — skipping OTP email', { email, strategy: config.gmail.strategy });
      return;
    }
    logger.info('Preparing to send OTP email', { email, strategy: config.gmail.strategy });
    try {
      await sendMail(
        email,
        'Your Password Reset OTP',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center;
                      background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>If you didn't request this, ignore this email — your password won't change.</p>
          <p>— The PitchPerfect Team</p>
        </div>
        `
      );
      logger.info('OTP email sent', { email, strategy: config.gmail.strategy });
    } catch (error) {
      logger.error('Failed to send OTP email', { email, strategy: config.gmail.strategy, error });
      throw error;
    }
  },

  async sendVerificationEmail(name: string, email: string, verificationLink: string): Promise<void> {
    if (!isConfigured()) {
      logger.warn('Email not configured — skipping verification email', { email, strategy: config.gmail.strategy });
      return;
    }
    logger.info('Preparing to send verification email', { email, strategy: config.gmail.strategy });
    try {
      await sendMail(
        email,
        'Verify your PitchPerfect email',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to PitchPerfect, ${name}!</h2>
          <p>Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}"
               style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 6px;
                      text-decoration: none; font-weight: bold; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${verificationLink}" style="color: #2563eb;">${verificationLink}</a>
          </p>
          <p style="color: #999; font-size: 12px;">This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
          <p>— The PitchPerfect Team</p>
        </div>
        `
      );
      logger.info('Verification email sent', { email, strategy: config.gmail.strategy });
    } catch (error) {
      logger.error('Failed to send verification email', { email, strategy: config.gmail.strategy, error });
      throw error;
    }
  },

  async sendWelcomeEmail(name: string, email: string): Promise<void> {
    if (!isConfigured()) {
      logger.warn('Email not configured — skipping welcome email', { email, strategy: config.gmail.strategy });
      return;
    }

    try {
      await sendMail(
        email,
        'Welcome to PitchPerfect!',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to PitchPerfect, ${name}!</h2>
          <p>Your account has been created successfully.</p>
          <p>You've received <strong>10 free tokens</strong> to get started.</p>
          <p>Start crafting perfect pitch emails today.</p>
          <br/>
          <p>— The PitchPerfect Team</p>
        </div>
        `
      );
      logger.info('Welcome email sent', { email, strategy: config.gmail.strategy });
    } catch (error) {
      // Non-fatal: log and continue — don't fail signup over email errors
      logger.error('Failed to send welcome email', { email, strategy: config.gmail.strategy, error });
    }
  },
};
