import { create } from 'zustand';
import { goalsApi } from '../api/goals';
import { startOfMonth, endOfMonth, format, addMonths, subMonths } from 'date-fns';
import type { CalendarDay, CalendarDayDetails } from '../types';

interface CalendarState {
  /* Monthly grid data */
  currentMonth: Date;
  days: CalendarDay[];
  isLoading: boolean;
  error: string | null;

  /* Day details popup */
  selectedDate: string | null;
  selectedDayDetails: CalendarDayDetails | null;
  isDetailsLoading: boolean;
  isDetailsOpen: boolean;

  /* Actions */
  fetchMonth: (month: Date) => Promise<void>;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  clearError: () => void;
  openDayDetails: (date: string) => Promise<void>;
  closeDayDetails: () => void;
}

/**
 * Formats a Date into the YYYY-MM-DD string the backend expects.
 */
function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentMonth: new Date(),
  days: [],
  isLoading: false,
  error: null,

  selectedDate: null,
  selectedDayDetails: null,
  isDetailsLoading: false,
  isDetailsOpen: false,

  fetchMonth: async (month: Date) => {
    set({ isLoading: true, error: null, currentMonth: month });

    const startDate = toDateString(startOfMonth(month));
    const endDate = toDateString(endOfMonth(month));

    try {
      const days = await goalsApi.getCalendar(startDate, endDate);
      set({ days, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch calendar data',
        isLoading: false,
      });
    }
  },

  goToPrevMonth: () => {
    const prevMonth = subMonths(get().currentMonth, 1);
    get().fetchMonth(prevMonth);
  },

  goToNextMonth: () => {
    const nextMonth = addMonths(get().currentMonth, 1);
    get().fetchMonth(nextMonth);
  },

  clearError: () => set({ error: null }),

  openDayDetails: async (date: string) => {
    set({
      selectedDate: date,
      isDetailsOpen: true,
      isDetailsLoading: true,
      selectedDayDetails: null,
    });

    try {
      const details = await goalsApi.getCalendarDayDetails(date);
      set({ selectedDayDetails: details, isDetailsLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch day details',
        isDetailsLoading: false,
      });
    }
  },

  closeDayDetails: () => {
    set({
      isDetailsOpen: false,
      selectedDate: null,
      selectedDayDetails: null,
      isDetailsLoading: false,
    });
  },
}));
