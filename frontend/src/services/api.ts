const API_BASE = '/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem('travel_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem('travel_token');
    localStorage.removeItem('travel_current_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
      if (typeof errorMessage === 'object' && errorMessage !== null) {
        errorMessage = Object.values(errorMessage)[0] as string || errorMessage;
      }
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage[0];
      }
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ user: any; token: string; refresh: string }>('/auth/login/', {
      method: 'POST',
      body: { username, password },
    }),

  register: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone: string;
  }) =>
    apiRequest<{ user: any; token: string; refresh: string }>('/auth/register/', {
      method: 'POST',
      body: data,
    }),

  logout: () =>
    apiRequest('/auth/logout/', {
      method: 'POST',
      body: { refresh: localStorage.getItem('travel_refresh') },
    }),

  getProfile: async () => {
    const data = await apiRequest<any>('/auth/profile/');
    localStorage.setItem('travel_current_user', JSON.stringify(data));
    return data;
  },

  updateProfile: (data: any) =>
    apiRequest<any>('/auth/profile/', {
      method: 'PATCH',
      body: data,
    }),
};

// Tours API
export const toursApi = {
  getList: (filters?: {
    country?: number;
    category?: number;
    price_min?: number;
    price_max?: number;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.country) params.append('country', String(filters.country));
    if (filters?.category) params.append('category', String(filters.category));
    if (filters?.price_min) params.append('price_min', String(filters.price_min));
    if (filters?.price_max) params.append('price_max', String(filters.price_max));
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString();
    return apiRequest<any[]>(`/tours/${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => apiRequest<any>(`/tours/${id}/`),

  getCountries: () => apiRequest<any[]>('/countries/'),

  getCategories: () => apiRequest<any[]>('/categories/'),
};

// Admin Tours API
export const adminToursApi = {
  getList: () => apiRequest<any[]>('/admin/tours/'),

  create: (data: any) =>
    apiRequest<any>('/admin/tours/', {
      method: 'POST',
      body: data,
    }),

  update: (id: number, data: any) =>
    apiRequest<any>(`/admin/tours/${id}/`, {
      method: 'PATCH',
      body: data,
    }),

  delete: (id: number) =>
    apiRequest(`/admin/tours/${id}/`, {
      method: 'DELETE',
    }),
};

// Bookings API
export const bookingsApi = {
  getMy: () => apiRequest<any[]>('/bookings/'),

  create: (data: {
    tour: number;
    participants: number;
    start_date: string;
    bonus_used: number;
  }) =>
    apiRequest<any>('/bookings/create/', {
      method: 'POST',
      body: data,
    }),

  pay: (id: number) =>
    apiRequest<{ message: string; bonus_earned: number }>(`/bookings/${id}/pay/`, {
      method: 'POST',
    }),

  cancel: (id: number) =>
    apiRequest<{ message: string }>(`/bookings/${id}/cancel/`, {
      method: 'POST',
    }),
};

// Admin Bookings API
export const adminBookingsApi = {
  getAll: () => apiRequest<any[]>('/admin/bookings/'),

  pay: (id: number) =>
    apiRequest(`/admin/bookings/${id}/pay/`, {
      method: 'POST',
    }),

  cancel: (id: number) =>
    apiRequest(`/admin/bookings/${id}/cancel/`, {
      method: 'POST',
    }),
};

// Wishlist API
export const wishlistApi = {
  get: () => apiRequest<any[]>('/wishlist/'),

  add: (tourId: number) =>
    apiRequest<any>('/wishlist/add/', {
      method: 'POST',
      body: { tour: tourId },
    }),

  remove: (tourId: number) =>
    apiRequest(`/wishlist/${tourId}/`, {
      method: 'DELETE',
    }),
};

// Transactions API
export const transactionsApi = {
  get: () => apiRequest<any[]>('/transactions/'),
};

// Postcards API
export const postcardsApi = {
  get: () => apiRequest<any[]>('/postcards/'),

  create: (data: { tour: number; image_url: string; message: string }) =>
    apiRequest<any>('/postcards/create/', {
      method: 'POST',
      body: data,
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiRequest<any[]>('/users/'),

  updateRole: (id: number, role: string) =>
    apiRequest<any>(`/users/${id}/role/`, {
      method: 'PATCH',
      body: { role },
    }),
};

// Admin Stats API
export const statsApi = {
  get: () => apiRequest<any>('/admin/stats/'),
};

// Assistant API
export const assistantApi = {
  recommend: (preferences: string) =>
    apiRequest<{ tours: any[] }>('/assistant/recommend/', {
      method: 'POST',
      body: { preferences },
    }),
};