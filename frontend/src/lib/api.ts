import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from '@/config';

const api: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const response = await axios.post(`${config.api.baseUrl}${config.api.endpoints.auth.refresh}`, {}, { withCredentials: true });
        const { accessToken } = response.data;
        
        if (accessToken) {
          localStorage.setItem('authToken', accessToken);
          originalRequest.headers = {
            ...originalRequest.headers,
            'Authorization': `Bearer ${accessToken}`,
          };
          return api(originalRequest);
        }
      } catch (error) {
        // Refresh token failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post(config.api.endpoints.auth.login, credentials),
  register: (userData: { username: string; email: string; password: string }) =>
    api.post(config.api.endpoints.auth.register, userData),
  refreshToken: () => api.post(config.api.endpoints.auth.refresh),
};

export const ticketApi = {
  getAllTickets: () => api.get(config.api.endpoints.tickets.base),
  getTicketById: (id: string) => api.get(config.api.endpoints.tickets.byId(id)),
  createTicket: (ticketData: any) => api.post(config.api.endpoints.tickets.base, ticketData),
  updateTicket: (id: string, ticketData: any) => 
    api.put(config.api.endpoints.tickets.byId(id), ticketData),
  deleteTicket: (id: string) => api.delete(config.api.endpoints.tickets.byId(id)),
};

export const memoryApi = {
  getMemories: () => api.get(config.api.endpoints.memories.base),
  searchMemories: (query: string) => 
    api.get(config.api.endpoints.memories.search, { params: { q: query } }),
  addMemory: (memoryData: any) => api.post(config.api.endpoints.memories.base, memoryData),
};

export const analyticsApi = {
  getDashboardStats: () => api.get(config.api.endpoints.analytics.dashboard),
  getAgentPerformance: () => api.get(config.api.endpoints.analytics.agentPerformance),
};

export default api;
