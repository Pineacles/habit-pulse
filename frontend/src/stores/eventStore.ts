import { create } from 'zustand';
import { eventsApi } from '../api/events';
import type { Event, CreateEventRequest, UpdateEventRequest } from '../types';

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;

  fetchEvents: (date?: string) => Promise<void>;
  createEvent: (data: CreateEventRequest) => Promise<void>;
  updateEvent: (id: string, data: UpdateEventRequest) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async (date?: string) => {
    set({ isLoading: true, error: null });
    try {
      const events = await eventsApi.getAll(date);
      set({ events, isLoading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch events', 
        isLoading: false 
      });
    }
  },

  createEvent: async (data: CreateEventRequest) => {
    set({ isLoading: true, error: null });
    try {
      await eventsApi.create(data);
      // Refresh events list
      await get().fetchEvents();
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to create event', 
        isLoading: false 
      });
      throw err;
    }
  },

  updateEvent: async (id: string, data: UpdateEventRequest) => {
    // Optimistic update
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    }));

    try {
      await eventsApi.update(id, data);
      // Refresh events list to get updated data
      await get().fetchEvents();
    } catch (err) {
      // Revert on error - refetch to get correct state
      await get().fetchEvents();
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update event', 
        isLoading: false 
      });
      throw err;
    }
  },

  deleteEvent: async (id: string) => {
    // Optimistic update - remove immediately
    const previousEvents = get().events;
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    }));

    try {
      await eventsApi.delete(id);
      set({ isLoading: false });
    } catch (err) {
      // Revert on error
      set({ 
        events: previousEvents,
        error: err instanceof Error ? err.message : 'Failed to delete event', 
        isLoading: false 
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
