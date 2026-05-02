/**
 * SyncSpace Frontend — API Service
 * Centralized HTTP client for backend API calls
 */

import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get the current user's Firebase ID token for API authentication
 */
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// Task API
// ============================================

export const taskApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest<{ success: boolean; data: unknown[] }>(`/tasks${query}`);
  },
  getById: (id: string) =>
    apiRequest<{ success: boolean; data: unknown }>(`/tasks/${id}`),
  create: (task: unknown) =>
    apiRequest<{ success: boolean; data: unknown }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
  update: (id: string, task: unknown) =>
    apiRequest<{ success: boolean; data: unknown }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }),
  updateStatus: (id: string, status: string, order?: number) =>
    apiRequest<{ success: boolean; data: unknown }>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, order }),
    }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
};

// ============================================
// Channel API
// ============================================

export const channelApi = {
  getAll: () =>
    apiRequest<{ success: boolean; data: unknown[] }>('/channels'),
  create: (channel: unknown) =>
    apiRequest<{ success: boolean; data: unknown }>('/channels', {
      method: 'POST',
      body: JSON.stringify(channel),
    }),
  getMessages: (channelId: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest<{ success: boolean; data: unknown[] }>(`/channels/${channelId}/messages${query}`);
  },
  sendMessage: (channelId: string, message: unknown) =>
    apiRequest<{ success: boolean; data: unknown }>(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    }),
  join: (channelId: string) =>
    apiRequest<{ success: boolean }>(`/channels/${channelId}/join`, { method: 'POST' }),
};

// ============================================
// AI API
// ============================================

export const aiApi = {
  summarize: (text: string, type: string = 'channel') =>
    apiRequest<{ success: boolean; data: unknown }>('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ text, type }),
    }),
  generateTasks: (text: string) =>
    apiRequest<{ success: boolean; data: unknown[] }>('/ai/generate-tasks', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  smartSearch: (query: string, context: string = '') =>
    apiRequest<{ success: boolean; data: { answer: string } }>('/ai/smart-search', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    }),
  getStatus: () =>
    apiRequest<{ success: boolean; data: unknown }>('/ai/status'),
};

// ============================================
// Calendar API
// ============================================

export const calendarApi = {
  getEvents: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest<{ success: boolean; data: unknown[] }>(`/calendar/events${query}`);
  },
  createEvent: (event: unknown) =>
    apiRequest<{ success: boolean; data: unknown }>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(event),
    }),
  createMeetLink: (title?: string) =>
    apiRequest<{ success: boolean; data: { meetLink: string } }>('/calendar/meet-link', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
};

// ============================================
// Analytics API
// ============================================

export const analyticsApi = {
  getTeamAnalytics: () =>
    apiRequest<{ success: boolean; data: unknown }>('/analytics/team'),
  getActivity: () =>
    apiRequest<{ success: boolean; data: unknown[] }>('/analytics/activity'),
};
