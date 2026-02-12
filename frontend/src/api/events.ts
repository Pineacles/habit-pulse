import api from './client';
import type { 
  Event, 
  CreateEventRequest, 
  UpdateEventRequest,
  CalendarEventDay,
  CalendarDayEvents
} from '../types';

export const eventsApi = {
  /**
   * Get all events, optionally filtered by date or date range
   * @param date - Single date filter (YYYY-MM-DD)
   * @param startDate - Range start date (YYYY-MM-DD)
   * @param endDate - Range end date (YYYY-MM-DD)
   */
  async getAll(date?: string, startDate?: string, endDate?: string): Promise<Event[]> {
    const params: Record<string, string> = {};
    if (date) {
      params.date = date;
    } else {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
    }
    const response = await api.get<Event[]>('/events', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data;
  },

  async getById(id: string): Promise<Event> {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  async create(data: CreateEventRequest): Promise<Event> {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  async update(id: string, data: UpdateEventRequest): Promise<Event> {
    const response = await api.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  async getCalendar(startDate: string, endDate: string): Promise<CalendarEventDay[]> {
    const response = await api.get<CalendarEventDay[]>('/events/calendar', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getCalendarDayEvents(date: string): Promise<CalendarDayEvents> {
    const response = await api.get<CalendarDayEvents>('/events/calendar/day', {
      params: { date },
    });
    return response.data;
  },
};
