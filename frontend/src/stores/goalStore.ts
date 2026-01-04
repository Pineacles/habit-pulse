import { create } from 'zustand';
import { goalsApi } from '../api/goals';
import type { GoalWithStatus, CreateGoalRequest, UpdateGoalRequest } from '../types';

interface GoalState {
  // State
  goals: GoalWithStatus[];
  isLoading: boolean;
  error: string | null;
  viewMode: 'today' | 'all'; // Track current view mode

  // Actions
  fetchGoals: (todayOnly?: boolean) => Promise<void>;
  createGoal: (data: CreateGoalRequest) => Promise<void>;
  updateGoal: (id: string, data: UpdateGoalRequest) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  reorderGoals: (orderedIds: string[]) => Promise<void>;
  clearError: () => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  // Initial state
  goals: [],
  isLoading: false,
  error: null,
  viewMode: 'today',

  // Fetch all goals
  fetchGoals: async (todayOnly = true) => {
    set({ isLoading: true, error: null, viewMode: todayOnly ? 'today' : 'all' });
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
      // Refresh goals list using current view mode
      const { viewMode } = get();
      await get().fetchGoals(viewMode === 'today');
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
    // Optimistic update for isActive toggle
    if (data.isActive !== undefined) {
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, isActive: data.isActive! } : g
        ),
      }));
    }

    try {
      await goalsApi.update(id, data);
      // Refresh goals list using current view mode
      const { viewMode } = get();
      await get().fetchGoals(viewMode === 'today');
    } catch (err) {
      // Revert on error - refetch to get correct state
      const { viewMode } = get();
      await get().fetchGoals(viewMode === 'today');
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update goal', 
        isLoading: false 
      });
      throw err;
    }
  },

  // Delete a goal
  deleteGoal: async (id: string) => {
    // Optimistic update - remove immediately
    const previousGoals = get().goals;
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));

    try {
      await goalsApi.delete(id);
      set({ isLoading: false });
    } catch (err) {
      // Revert on error
      set({ 
        goals: previousGoals,
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

  // Reorder goals by priority
  reorderGoals: async (orderedIds: string[]) => {
    // Optimistic update - reorder immediately in UI
    const currentGoals = get().goals;
    const reorderedGoals = orderedIds
      .map(id => currentGoals.find(g => g.id === id))
      .filter((g): g is GoalWithStatus => g !== undefined);
    
    // Keep any goals not in the reorder list at the end
    const remainingGoals = currentGoals.filter(g => !orderedIds.includes(g.id));
    
    set({ goals: [...reorderedGoals, ...remainingGoals] });

    try {
      await goalsApi.reorder(orderedIds);
    } catch (err) {
      // Revert on error
      set({ 
        goals: currentGoals,
        error: err instanceof Error ? err.message : 'Failed to reorder goals',
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
