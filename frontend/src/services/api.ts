import axios, { AxiosInstance, AxiosError } from 'axios';
import config from '../config';

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem('moviefinder-token');
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }
    
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.url}`, error.response?.data || error.message);
    }

    // Handle specific error codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login if needed
          localStorage.removeItem('moviefinder-token');
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
