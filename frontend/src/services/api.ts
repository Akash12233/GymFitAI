import axios, { type AxiosInstance, type AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';
const REQUEST_TIMEOUT = 120000; // 10 seconds

// API Response Interface
interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

// Error Interface
interface ApiError {
  statusCode: number;
  message: string;
  errors?: string[];
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitness-access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear tokens and redirect to login
          localStorage.removeItem('fitness-access-token');
          localStorage.removeItem('fitness-refresh-token');
          window.location.href = '/auth';
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data?.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data?.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', data?.message);
          break;
        default:
          console.error('API Error:', data?.message);
      }
      
      return Promise.reject({
        statusCode: status,
        message: data?.message || 'An error occurred',
        errors: data?.errors || []
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        statusCode: 0,
        message: 'Network error. Please check your connection.',
        errors: ['NETWORK_ERROR']
      });
    } else {
      // Other error
      return Promise.reject({
        statusCode: 0,
        message: 'An unexpected error occurred',
        errors: ['UNKNOWN_ERROR']
      });
    }
  }
);

// Retry logic for failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
  maxRetries: number = 3,
  delay: number = 5000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // console.log(`Attempt ${i + 1}`);
      const response = await requestFn();
      // console.log(response.data.data)
      return response.data.data;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

export { apiClient, retryRequest };
export type { ApiResponse, ApiError };