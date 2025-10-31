const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { error: error.message || 'An error occurred' };
    }

    const data = await response.json().catch(() => ({}));
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { error: 'Network error occurred' };
  }
}

// Tickets API
export const ticketsApi = {
  create: async (data: FormData) => {
    // Don't set Content-Type header, let the browser set it with the correct boundary
    const headers = new Headers();
    // Remove the default Content-Type header as we need the browser to set it with the correct boundary
    
    return apiRequest('/api/submit-ticket', {
      method: 'POST',
      body: data,
      headers // Empty headers to let the browser set the correct Content-Type with boundary
    });
  },
  
  getAll: () => apiRequest('/api/tickets'),
  
  getById: (id: string) => apiRequest(`/api/tickets/${id}`),
  
  process: (id: string) => 
    apiRequest(`/api/process-ticket/${id}`, {
      method: 'POST',
    }),
};

// Memory API
export const memoryApi = {
  getAll: () => apiRequest('/api/memories'),
  
  search: (query: string) => 
    apiRequest(`/api/memories/search?q=${encodeURIComponent(query)}`),
};
