import axios from 'axios';

// Dynamic base URL: Env var for prod (Vercel), fallback to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Base axios instance (updated baseURL)
const api = axios.create({
  baseURL: API_BASE,  // Now dynamic: e.g., Prod: https://backend.onrender.com
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set auth token globally (called in AuthContext)
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Single Request Interceptor: Auto-add token from localStorage to EVERY request (merged duplicates, added debug)
api.interceptors.request.use(
  (config) => {
    console.log('🔥 DEBUG: Interceptor - Request config:', config.method, config.url);  // Your debug log
    let token = localStorage.getItem('token');
    // FIXED: Safe type check for auth header (handles union type)
    const authHeader = api.defaults.headers.common['Authorization'];
    if (!token && typeof authHeader === 'string') {
      token = authHeader.replace('Bearer ', '');
    }
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔑 API Request: ${config.method?.toUpperCase()} ${config.url} | Token: ${!!token ? '✅ Present' : '❌ Missing'}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 globally (auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 401 Unauthorized - Logging out...');
      localStorage.removeItem('token');
      setAuthToken(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Projects API (WITH 'delete' METHOD - Fixes Previous TS Error)
export const projectsAPI = {
  getAll: () => api.get('/api/projects'),
  create: (data: { name: string; description?: string }) => api.post('/api/projects', data),
  delete: (id: string) => api.delete(`/api/projects/${id}`),  // For ProjectCard delete
};

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/api/auth/login', data),
  register: (data: { username: string; email: string; password: string }) => api.post('/api/auth/register', data),
};

// Chat/Messages API (For future chat steps)
export const chatAPI = {
  getByProject: (projectId: string) => api.get(`/api/chat/${projectId}`),
  send: (projectId: string, content: string) => api.post(`/api/chat/${projectId}`, { message: content }),  // FIXED: { message: content }
};

// Alias for messagesAPI (if used elsewhere)
export const messagesAPI = chatAPI;

export default api;