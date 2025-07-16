import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

// Type definitions
interface ApiError extends Error {
  userMessage?: string;
  status?: number;
  data?: unknown;
  code?: string;
}

interface ApiResponse<T = any> extends AxiosResponse<T> {}

// Configuration
const API_TIMEOUT = 15000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const api = axios.create({
  baseURL: '/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Request interceptor with retry logic
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const requestId = Date.now();
  const { method, url, params, data } = config;

  console.debug(`[${requestId}] Request: ${method?.toUpperCase()} ${url}`, {
    params,
    data: method === 'GET' ? undefined : data
  });

  // Add request metadata
  config.metadata = {
    requestId,
    retryCount: 0,
    startTime: new Date()
  };

  // Auth token example (uncomment if needed)
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }

  return config;
}, (error: AxiosError) => {
  console.error('Request Error:', error.message);
  return Promise.reject(error);
});

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const { status, config, data } = response;
    const { requestId, startTime } = config.metadata;
    const duration = new Date().getTime() - startTime.getTime();

    console.debug(`[${requestId}] Response: ${status} (${duration}ms)`, data);
    return response;
  },
  async (error: AxiosError) => {
    const originalConfig = error.config;
    const { requestId, retryCount } = originalConfig.metadata || {};
    const errorResponse: ApiError = new Error(error.message);

    // Handle cancellation
    if (axios.isCancel(error)) {
      console.debug(`[${requestId}] Request cancelled`);
      errorResponse.message = 'Request cancelled';
      errorResponse.userMessage = 'Operation was cancelled';
      return Promise.reject(errorResponse);
    }

    // Prepare error response
    if (error.response) {
      errorResponse.status = error.response.status;
      errorResponse.data = error.response.data;
      errorResponse.code = error.code;

      console.error(
        `[${requestId}] API Error: ${error.response.status}`,
        error.response.data
      );
    } else if (error.request) {
      console.error(`[${requestId}] Network Error:`, error.message);
      errorResponse.message = 'Network Error - Please check your connection';
    } else {
      console.error(`[${requestId}] Request Error:`, error.message);
    }

    // Retry logic for network errors or 5xx status codes
    if (
      (!error.response || (error.response.status >= 500)) &&
      retryCount < MAX_RETRIES
    ) {
      console.debug(`[${requestId}] Retrying (${retryCount + 1}/${MAX_RETRIES})`);

      originalConfig.metadata.retryCount += 1;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

      return api(originalConfig);
    }

    // Enhanced error messages
    const errorMessages: Record<number, string> = {
      400: 'Invalid request - Please check your input',
      401: 'Session expired - Please login again',
      403: 'Permission denied - You don\'t have access',
      404: 'Resource not found',
      409: 'Conflict - Resource already exists',
      429: 'Too many requests - Please slow down',
      500: 'Server error - Please try again later',
      503: 'Service unavailable - Maintenance in progress',
    };

    errorResponse.userMessage = error.response?.status
      ? errorMessages[error.response.status] || 'An unexpected error occurred'
      : errorResponse.message;

    return Promise.reject(errorResponse);
  }
);

// API endpoints with TypeScript generics
export const getEvents = <T = any>(params?: object, cancelToken?: CancelTokenSource): Promise<ApiResponse<T>> =>
  api.get('/events', { params, cancelToken: cancelToken?.token });

export const createEvent = <T = any>(event: T, cancelToken?: CancelTokenSource): Promise<ApiResponse<T>> =>
  api.post('/events', event, { cancelToken: cancelToken?.token });

export const updateEvent = <T = any>(id: string, event: T, cancelToken?: CancelTokenSource): Promise<ApiResponse<T>> =>
  api.put(`/events/${id}`, event, { cancelToken: cancelToken?.token });

export const deleteEvent = (id: string, cancelToken?: CancelTokenSource): Promise<ApiResponse> =>
  api.delete(`/events/${id}`, { cancelToken: cancelToken?.token });

// Health check endpoint
export const checkBackendHealth = (cancelToken?: CancelTokenSource): Promise<ApiResponse<{ status: string }>> =>
  api.get('/health', { cancelToken: cancelToken?.token });

// Utility functions
export const createCancelToken = (): CancelTokenSource => axios.CancelToken.source();

export const handleApiError = (
  error: ApiError,
  setError?: (message: string) => void,
  logger?: (message: string) => void
): string => {
  const log = logger || console.error;
  log(`API Error: ${error.message}`, error);

  const userMessage = error.userMessage || 'An unexpected error occurred';

  if (setError) {
    setError(userMessage);
  }

  return userMessage;
};

// Request timing utility
export const withRequestTimer = async <T>(promise: Promise<T>): Promise<[T, number]> => {
  const start = Date.now();
  const result = await promise;
  const duration = Date.now() - start;
  return [result, duration];
};

// Export axios instance for custom configurations
export default api;