export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    endpoints: {
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh',
      },
      tickets: {
        base: '/api/tickets',
        byId: (id: string) => `/api/tickets/${id}`,
      },
      memories: {
        base: '/api/memories',
        search: '/api/memories/search',
      },
      analytics: {
        dashboard: '/api/analytics/dashboard',
        agentPerformance: '/api/analytics/agent-performance',
      },
    },
  },
} as const;
