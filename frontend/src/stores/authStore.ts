import { create } from 'zustand';
import { authApi } from '../api/auth';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,

  // Login action
  login: async (data: LoginRequest) => {
    const response = await authApi.login(data);
    
    // Store token
    localStorage.setItem('token', response.token);
    
    // Fetch user info
    const user = await authApi.me();
    
    set({
      token: response.token,
      user,
      isAuthenticated: true,
    });
  },

  // Register action
  register: async (data: RegisterRequest) => {
    await authApi.register(data);
    // After registering, login automatically
    await get().login(data);
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Check if user is authenticated (called on app load)
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await authApi.me();
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Token invalid or expired
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
