// HTTP client with auth token handling
import { ApiResponse, ApiError } from '../utils/errors';

const API_URL = 'http://localhost:8000';

/**
 * Success response interface with data
 */
export interface ApiSuccess<T> extends ApiResponse {
  data: T;
}

/**
 * Standard API result interface - can be success or error
 */
export type ApiResult<T> = ApiSuccess<T> | ApiError;

/**
 * Creates a fetch request with authentication headers if a token is provided
 */
async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}, 
  token?: string
): Promise<Response> {
  // Base URL handling
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  
  // Headers with auth token if available
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Merge options with headers
  const requestOptions: RequestInit = {
    ...options,
    headers
  };
  
  // Execute request
  return fetch(fullUrl, requestOptions);
}

// We'll use ApiError directly instead of a custom HTTP error class

/**
 * Helper function to handle API error responses
 */
async function handleErrorResponse(response: Response): Promise<never> {
  const status = response.status;
  
  try {
    // Parse JSON response if available
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      
      // Add status code to the error data
      const apiError: ApiError = {
        ...errorData,
        statusCode: status
      };
      
      throw apiError;
    } else {
      // For non-JSON responses, create a simple error
      const text = await response.text();
      throw {
        error: text || getDefaultErrorMessage(status),
        statusCode: status,
        fieldErrors: {}
      } as ApiError;
    }
  } catch (e) {
    // If parsing fails, or any other error occurs
    if (e.statusCode) {
      // If it's already our ApiError format, just rethrow
      throw e;
    }
    
    // Otherwise create a simple error
    throw {
      error: getDefaultErrorMessage(status),
      statusCode: status,
      fieldErrors: {}
    } as ApiError;
  }
}

/**
 * Get a default error message based on HTTP status code
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400: return 'Bad request';
    case 401: return 'Authentication required';
    case 403: return 'Access forbidden';
    case 404: return 'Resource not found';
    case 409: return 'Conflict with current state';
    case 422: return 'Validation failed';
    case 429: return 'Too many requests';
    case 500: return 'Server error';
    case 503: return 'Service unavailable';
    default: return `HTTP error ${status}`;
  }
}

/**
 * HTTP client with methods for different request types
 */
export const http = {
  /**
   * GET request
   */
  get: async <T>(url: string, token?: string): Promise<T> => {
    const response = await fetchWithAuth(url, { method: 'GET' }, token);
    
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    return response.json();
  },
  
  /**
   * POST request
   */
  post: async <T>(url: string, data: any, token?: string): Promise<T> => {
    const response = await fetchWithAuth(
      url, 
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      token
    );
    
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    return response.json();
  },
  
  /**
   * PUT request
   */
  put: async <T>(url: string, data: any, token?: string): Promise<T> => {
    const response = await fetchWithAuth(
      url, 
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      token
    );
    
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    return response.json();
  },
  
  /**
   * DELETE request
   */
  delete: async <T>(url: string, token?: string): Promise<T> => {
    const response = await fetchWithAuth(url, { method: 'DELETE' }, token);
    
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    
    return response.json();
  },
  
  /**
   * Send a request and handle both success and error cases with a standardized return format
   */
  request: async <T>(method: string, url: string, data?: any, token?: string): Promise<ApiResult<T>> => {
    try {
      let response;
      
      // Choose the appropriate method
      if (method.toUpperCase() === 'GET') {
        response = await http.get<T>(url, token);
      } else if (method.toUpperCase() === 'POST') {
        response = await http.post<T>(url, data, token);
      } else if (method.toUpperCase() === 'PUT') {
        response = await http.put<T>(url, data, token);
      } else if (method.toUpperCase() === 'DELETE') {
        response = await http.delete<T>(url, token);
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      // Return successful response
      return {
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`${method} request error:`, error);
      
      // Handle HttpError with field and global errors
      if (error instanceof HttpError) {
        return error.toApiResult<T>();
      }
      
      // Handle other errors
      return {
        error: error instanceof Error 
          ? error.message 
          : 'Network error, please check your connection'
      };
    }
  }
};