import { create } from 'zustand';
import { goalsApi } from '../api/goals';
import type { GoalWithStatus, CreateGoalRequest, UpdateGoalRequest } from '../types';

interface GoalState {
  // State
  goals: GoalWithStatus[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchGoals: (todayOnly?: boolean) => Promise<void>;
  createGoal: (data: CreateGoalRequest) => Promise<void>;
  updateGoal: (id: string, data: UpdateGoalRequest) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  // Initial state
  goals: [],
  isLoading: false,
  error: null,

  // Fetch all goals
  fetchGoals: async (todayOnly = true) => {
    set({ isLoading: true, error: null });
    try {
      const goals = await goalsApi.getAll(todayOnly);
      set({ goals, isLoading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch goals', 
        isLoading: false 
      });
    }
  },

  // Create a new goal
  createGoal: async (data: CreateGoalRequest) => {
    set({ isLoading: true, error: null });
    try {
      await goalsApi.create(data);
      // Refresh goals list
      await get().fetchGoals();
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to create goal', 
        isLoading: false 
      });
      throw err;
    }
  },

  // Update an existing goal
  updateGoal: async (id: string, data: UpdateGoalRequest) => {
    set({ isLoading: true, error: null });
    try {
      await goalsApi.update(id, data);
      // Refresh goals list
      await get().fetchGoals();
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update goal', 
        isLoading: false 
      });
      throw err;
    }
  },

  // Delete a goal
  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await goalsApi.delete(id);
      // Remove from local state immediately
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to delete goal', 
        isLoading: false 
      });
      throw err;
    }
  },

  // Toggle goal completion
  toggleGoal: async (id: string) => {
    // Optimistic update - toggle immediately in UI
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, isCompletedToday: !g.isCompletedToday } : g
      ),
    }));

    try {
      await goalsApi.toggle(id);
    } catch (err) {
      // Revert on error
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, isCompletedToday: !g.isCompletedToday } : g
        ),
        error: err instanceof Error ? err.message : 'Failed to toggle goal',
      }));
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
