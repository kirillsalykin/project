// HTTP client with auth token handling
import { ApiErrorResponse, parseApiError } from '../utils/errors';

const API_URL = 'http://localhost:8000';

// Extended response type including field errors
export interface ApiResult<T> {
  data?: T;
  error: string | null;
  fieldErrors?: Record<string, string[]>;
  statusCode?: number;
}

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

// Custom error class for HTTP errors that includes status code and parsed response
export class HttpError extends Error {
  status: number;
  data?: any;
  apiError: ApiErrorResponse;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    this.apiError = parseApiError(data); // Parse to standardized format
  }
  
  // Convert HttpError to standard result format
  toApiResult<T>(): ApiResult<T> {
    return {
      data: undefined,
      error: this.message,
      fieldErrors: this.apiError.fieldErrors,
      statusCode: this.status
    };
  }
}

/**
 * Helper function to handle API error responses
 */
async function handleErrorResponse(response: Response): Promise<never> {
  const status = response.status;
  let errorMessage = getDefaultErrorMessage(status);
  let errorData;

  // Try to parse error body as JSON
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      errorData = await response.json();
      
      // Use first global error as the main message if available
      if (errorData.globalErrors && Array.isArray(errorData.globalErrors) && errorData.globalErrors.length > 0) {
        errorMessage = errorData.globalErrors[0];
      }
      // Fallback to message field if present
      else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      // If response doesn't have our expected format, normalize it
      if (!errorData.globalErrors && !errorData.fieldErrors) {
        errorData = {
          globalErrors: [errorMessage]
        };
      }
    } else {
      // Handle non-JSON errors
      const textError = await response.text();
      if (textError) {
        errorMessage = textError;
        // Create error data with appropriate format
        errorData = { globalErrors: [textError] };
      } else {
        // Empty response, use default message
        errorData = { globalErrors: [errorMessage] };
      }
    }
  } catch (e) {
    console.error('Failed to parse error response:', e);
    // Create error data for parse error
    errorData = { globalErrors: ['Failed to parse server response'] };
  }

  throw new HttpError(status, errorMessage, errorData);
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