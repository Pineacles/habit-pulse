import api from './client';
import type { 
  GoalWithStatus, 
  Goal, 
  CreateGoalRequest, 
  UpdateGoalRequest, 
  ToggleResponse 
} from '../types';

export const goalsApi = {
  // Get all goals (optionally filtered to today only)
  async getAll(todayOnly: boolean = true): Promise<GoalWithStatus[]> {
    const response = await api.get<GoalWithStatus[]>('/goals', {
      params: { todayOnly },
    });
    return response.data;
  },

  // Get a single goal by ID
  async getById(id: string): Promise<Goal> {
    const response = await api.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  // Create a new goal
  async create(data: CreateGoalRequest): Promise<Goal> {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },

  // Update an existing goal
  async update(id: string, data: UpdateGoalRequest): Promise<Goal> {
    const response = await api.put<Goal>(`/goals/${id}`, data);
    return response.data;
  },

  // Delete a goal
  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },

  // Toggle goal completion for today
  async toggle(id: string): Promise<ToggleResponse> {
    const response = await api.post<ToggleResponse>(`/goals/${id}/toggle`);
    return response.data;
  },

  // Reorder goals by priority
  async reorder(orderedIds: string[]): Promise<void> {
    await api.post('/goals/reorder', { goalIds: orderedIds });
  },
};
