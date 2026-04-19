import { UserModel } from '../models/User';
import { EmailGenerationModel } from '../models/EmailGeneration';
import { hashPassword, verifyPassword } from '../utils/security';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { User, ApiResponse } from '../types/index';

export const authService = {
  async signup(name: string, email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const existingUser = await UserModel.findOne({ email });

      if (existingUser) {
        return {
          success: false,
          message: 'User already exists',
          error: 'User with this email already registered',
        };
      }

      const passwordHash = await hashPassword(password);

      const newUser = new UserModel({
        name,
        email,
        passwordHash,
        tokens: 10, // Free plan
        plan: 'free',
      });

      await newUser.save();

      const token = generateToken(newUser._id.toString(), newUser.email);
      const refreshToken = generateRefreshToken(newUser._id.toString(), newUser.email);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          userId: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          tokens: newUser.tokens,
          plan: newUser.plan,
          token,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Signup failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const user = await UserModel.findOne({ email });

      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'User not found',
        };
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'Incorrect password',
        };
      }

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
      return {
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        message: 'User profile retrieved',
        data: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          tokens: user.tokens,
          plan: user.plan,
          passwordHash: '', // Don't send password hash
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

export const tokenService = {
  async getUserTokens(userId: string): Promise<ApiResponse<number>> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        message: 'Token balance retrieved',
        data: user.tokens,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch tokens',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async deductTokens(userId: string, tokensToDeduct: number): Promise<ApiResponse<number>> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (user.tokens < tokensToDeduct) {
        return {
          success: false,
          message: 'Insufficient tokens',
          error: `Need ${tokensToDeduct} tokens but only have ${user.tokens}`,
        };
      }

      user.tokens -= tokensToDeduct;
      await user.save();

      return {
        success: true,
        message: 'Tokens deducted successfully',
        data: user.tokens,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to deduct tokens',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async addTokens(userId: string, tokensToAdd: number): Promise<ApiResponse<number>> {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      user.tokens += tokensToAdd;
      await user.save();

      return {
        success: true,
        message: 'Tokens added successfully',
        data: user.tokens,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add tokens',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
