import api from './client';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types';

export const authApi = {
  // Register a new user
  async register(data: RegisterRequest): Promise<void> {
    await api.post('/auth/register', data);
  },

  // Login and get JWT token
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  // Get current user info
  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
