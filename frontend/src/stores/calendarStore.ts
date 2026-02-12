import { create } from 'zustand';
import { goalsApi } from '../api/goals';
import { eventsApi } from '../api/events';
import { startOfMonth, endOfMonth, format, addMonths, subMonths, isFuture, parseISO } from 'date-fns';
import type { CalendarDay, CalendarDayDetails, CalendarEventDay, CalendarDayEvents, Event } from '../types';

export type CalendarViewMode = 'habits' | 'events' | 'all';

interface CalendarState {
  /* Monthly grid data */
  currentMonth: Date;
  days: CalendarDay[];
  eventDays: CalendarEventDay[];
  monthEvents: Event[]; // Full event details for inline rendering
  viewMode: CalendarViewMode;
  isLoading: boolean;
  error: string | null;

  /* Day details popup */
  selectedDate: string | null;
  selectedDayDetails: CalendarDayDetails | null;
  selectedDayEvents: CalendarDayEvents | null;
  isDetailsLoading: boolean;
  isDetailsOpen: boolean;

  /* Actions */
  fetchMonth: (month: Date) => Promise<void>;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  setViewMode: (mode: CalendarViewMode) => void;
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
  eventDays: [],
  monthEvents: [],
  viewMode: 'habits',
  isLoading: false,
  error: null,

  selectedDate: null,
  selectedDayDetails: null,
  selectedDayEvents: null,
  isDetailsLoading: false,
  isDetailsOpen: false,

  fetchMonth: async (month: Date) => {
    set({ isLoading: true, error: null, currentMonth: month });

    const startDate = toDateString(startOfMonth(month));
    const endDate = toDateString(endOfMonth(month));

    try {
      const { viewMode } = get();
      
      // Fetch habits data for 'habits' and 'all' modes
      let days: CalendarDay[] = [];
      if (viewMode === 'habits' || viewMode === 'all') {
        days = await goalsApi.getCalendar(startDate, endDate);
      }

      // Fetch events data for 'events' and 'all' modes
      let eventDays: CalendarEventDay[] = [];
      let monthEvents: Event[] = [];
      if (viewMode === 'events' || viewMode === 'all') {
        eventDays = await eventsApi.getCalendar(startDate, endDate);
        // Also fetch full event details for inline rendering in calendar cells
        monthEvents = await eventsApi.getAll(undefined, startDate, endDate);
      }

      set({ days, eventDays, monthEvents, isLoading: false });
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

  setViewMode: (mode: CalendarViewMode) => {
    set({ viewMode: mode });
    // Refetch data for new mode
    get().fetchMonth(get().currentMonth);
  },

  clearError: () => set({ error: null }),

  openDayDetails: async (date: string) => {
    set({
      selectedDate: date,
      isDetailsOpen: true,
      isDetailsLoading: true,
      selectedDayDetails: null,
      selectedDayEvents: null,
    });

    try {
      const { viewMode } = get();
      const isFutureDate = isFuture(parseISO(date));
      
      // Fetch habits for:
      // - habits mode (existing behavior)
      // - all mode only for non-future dates
      let habitDetails: CalendarDayDetails | null = null;
      if (viewMode === 'habits' || (viewMode === 'all' && !isFutureDate)) {
        habitDetails = await goalsApi.getCalendarDayDetails(date);
      }

      // Fetch events in events/all modes (future-facing)
      let eventDetails: CalendarDayEvents | null = null;
      if (viewMode === 'events' || viewMode === 'all') {
        eventDetails = await eventsApi.getCalendarDayEvents(date);
      }

      set({ 
        selectedDayDetails: habitDetails, 
        selectedDayEvents: eventDetails,
        isDetailsLoading: false 
      });
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
      selectedDayEvents: null,
      isDetailsLoading: false,
    });
  },
}));
