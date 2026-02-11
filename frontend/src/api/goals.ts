import api from './client';
import type { 
  GoalWithStatus, 
  Goal, 
  CreateGoalRequest, 
  UpdateGoalRequest, 
  ToggleResponse,
  CalendarDay,
  CalendarDayDetails 
} from '../types';

export const goalsApi = {
  // Get all goals (optionally filtered to today only)
  async getAll(todayOnly: boolean = true): Promise<GoalWithStatus[]> {
    const response = await api.get<GoalWithStatus[]>('/goals', {
      params: { todayOnly },
    });
    return response.data;
  },

  async getById(id: string): Promise<Goal> {
    const response = await api.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  async create(data: CreateGoalRequest): Promise<Goal> {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },

  async update(id: string, data: UpdateGoalRequest): Promise<Goal> {
    const response = await api.put<Goal>(`/goals/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },

  async toggle(id: string): Promise<ToggleResponse> {
    const response = await api.post<ToggleResponse>(`/goals/${id}/toggle`);
    return response.data;
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await api.post('/goals/reorder', { goalIds: orderedIds });
  },

  async getCalendar(startDate: string, endDate: string): Promise<CalendarDay[]> {
    const response = await api.get<CalendarDay[]>('/goals/calendar', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getCalendarDayDetails(date: string): Promise<CalendarDayDetails> {
    const response = await api.get<CalendarDayDetails>('/goals/calendar/day', {
      params: { date },
    });
    return response.data;
  },
};
