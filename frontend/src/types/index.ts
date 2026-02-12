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
  isMeasurable: boolean;
  targetValue: number;
  unit: string;
  targetMinutes: number; // Backward compatibility
  scheduleDays: number[];
  intervalDays: number | null;
  intervalStartDate: string | null; // ISO date string "2025-01-05"
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface GoalWithStatus extends Goal {
  isCompletedToday: boolean;
}

export interface CreateGoalRequest {
  name: string;
  isMeasurable?: boolean;
  targetValue?: number;
  unit?: string;
  scheduleDays?: number[];
  intervalDays?: number | null;
  intervalStartDate?: string | null;
  description?: string | null;
}

export interface UpdateGoalRequest {
  name?: string;
  isMeasurable?: boolean;
  targetValue?: number;
  unit?: string;
  scheduleDays?: number[];
  intervalDays?: number | null;
  intervalStartDate?: string | null;
  description?: string | null;
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

// Unit options for measurable goals
export const UNIT_OPTIONS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'pages', label: 'Pages' },
  { value: 'reps', label: 'Reps' },
  { value: 'liters', label: 'Liters' },
  { value: 'km', label: 'Kilometers' },
  { value: 'items', label: 'Items' },
] as const;

export type UnitType = typeof UNIT_OPTIONS[number]['value'];

// Day names for schedule display
export const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

// Schedule type helper
export type ScheduleType = 'everyday' | 'weekdays' | 'weekends' | 'custom-days' | 'custom-interval';

// Calendar types
export interface CalendarDay {
  date: string;          // "2025-01-15" (YYYY-MM-DD)
  totalScheduled: number;
  completed: number;
}

export type CalendarIntensity = 'green' | 'yellow' | 'red' | 'empty' | 'future' | 'event';

export interface CalendarGoalItem {
  id: string;
  name: string;
  isMeasurable: boolean;
  targetValue: number;
  unit: string;
}

export interface CalendarDayDetails {
  date: string;
  totalScheduled: number;
  completed: number;
  done: CalendarGoalItem[];
  notDone: CalendarGoalItem[];
}

// Event types
export interface Event {
  id: string;
  title: string;
  date: string;          // "YYYY-MM-DD"
  time: string | null;   // "HH:mm" or null
  description: string | null;
  status: 'active' | 'completed' | 'cancelled';
  sortOrder: number;
  source: string;        // 'local' | 'google' | 'outlook'
  externalId: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface CreateEventRequest {
  title: string;
  date: string;
  time?: string | null;
  description?: string | null;
}

export interface UpdateEventRequest {
  title?: string;
  date?: string;
  time?: string | null;
  description?: string | null;
  status?: 'active' | 'completed' | 'cancelled';
  sortOrder?: number;
}

export interface CalendarEventDay {
  date: string;
  eventCount: number;
}

export interface CalendarDayEvents {
  date: string;
  events: Event[];
}
