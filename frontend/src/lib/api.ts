import apiClient from './apiClient';
import { AuthResponse, UserProfile } from '../types/index';

export const authAPI = {
  async signup(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/signup', {
      name,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getProfile(): Promise<any> {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  async updateProfile(profile: UserProfile): Promise<any> {
    const response = await apiClient.put('/api/auth/profile', { profile });
    return response.data;
  },

  async getUserProfile(): Promise<any> {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  async forgotPassword(email: string): Promise<any> {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email: string, otp: string, newPassword: string, confirmPassword: string): Promise<any> {
    const response = await apiClient.post('/api/auth/reset-password', {
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

export const emailAPI = {
  async generateEmails(input: any): Promise<any> {
    const response = await apiClient.post('/api/email/generate', input);
    return response.data;
  },

  async getHistory(limit: number = 10): Promise<any> {
    const response = await apiClient.get(`/api/email/history?limit=${limit}`);
    return response.data;
  },

  async getGeneration(generationId: string): Promise<any> {
    const response = await apiClient.get(`/api/email/${generationId}`);
    return response.data;
  },
};

export const paymentAPI = {
  async initiatePayment(plan: string, amount: number): Promise<any> {
    const response = await apiClient.post('/api/payment/initiate', {
      plan,
      amount,
    });
    return response.data;
  },

  async confirmPayment(paymentId: string, transactionId: string): Promise<any> {
    const response = await apiClient.post('/api/payment/success', {
      paymentId,
      transactionId,
    });
    return response.data;
  },

  async getHistory(): Promise<any> {
    const response = await apiClient.get('/api/payment/history');
    return response.data;
  },

  async getTokenBalance(): Promise<any> {
    const response = await apiClient.get('/api/tokens/balance');
    return response.data;
  },
};
