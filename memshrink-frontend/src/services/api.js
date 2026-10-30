import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 8000 });

export const memoryAPI = {
  getStats:     () => api.get('/memory/stats'),
  getProcesses: () => api.get('/memory/processes'),
  getHistory:   (period = 'day') => api.get(`/memory/history?period=${period}`),
};

export const optimizeAPI = {
  getRecommendations: () => api.get('/optimize/recommendations'),
  simulate:           (payload) => api.post('/optimize/simulate', payload),
  getHistory:         () => api.get('/optimize/history'),
};

export const alertsAPI = {
  getAlerts: () => api.get('/alerts'),
  checkAlerts: (payload) => api.post('/alerts/check', payload),
  markRead: (id) => api.patch(`/alerts/${id}/read`),
  markAllRead: () => api.patch('/alerts/read-all'),
};

export const systemAPI = {
  getInfo: () => api.get('/system/info'),
};

export default api;
