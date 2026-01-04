// User types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  expiresAt: string;
}

// Goal types
export interface Goal {
  id: string;
  name: string;
  targetMinutes: number;
  scheduleDays: number[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface GoalWithStatus extends Goal {
  isCompletedToday: boolean;
}

export interface CreateGoalRequest {
  name: string;
  targetMinutes: number;
  scheduleDays?: number[];
}

export interface UpdateGoalRequest {
  name?: string;
  targetMinutes?: number;
  scheduleDays?: number[];
  sortOrder?: number;
  isActive?: boolean;
}

export interface ToggleResponse {
  isCompleted: boolean;
}

// Theme types
export type ThemeColor = 'orange' | 'teal' | 'purple' | 'blue' | 'rose' | 'emerald';

export interface UserSettings {
  theme: ThemeColor;
}

// Day names for schedule display
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
