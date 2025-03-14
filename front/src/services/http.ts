// HTTP client with auth token handling
import { ApiErrorResponse, parseApiError } from '../utils/errors';

const API_URL = 'http://localhost:8000';

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
}

/**
 * Helper function to handle API error responses
 */
async function handleErrorResponse(response: Response): Promise<never> {
  const status = response.status;
  let errorMessage = `HTTP error ${status}`;
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
    } else {
      // Handle non-JSON errors
      const textError = await response.text();
      if (textError) {
        errorMessage = textError;
      }
    }
  } catch (e) {
    console.error('Failed to parse error response:', e);
  }

  throw new HttpError(status, errorMessage, errorData);
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
  }
};