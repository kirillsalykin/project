import { SignUpInput, AuthenticatedResponse } from '../types/api';

const API_URL = 'http://localhost:8000';

export namespace Api {
  export interface Error {
    code: string;
    message: string | null;
    params: Record<string, any>;
  }
}

export interface ApiError {
  _global?: Api.Error[];
  [key: string]: Api.Error[] | undefined;
}

export type ApiResult<T> = 
  | { type: 'success'; data: T }
  | { type: 'error'; error: ApiError };

/**
 * Simple API client for making HTTP requests
 */
export const api = {
  /**
   * Make a fetch request to the API
   */
  fetch: async <T>(
    method: string,
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<ApiResult<T>> => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    // Build request options
    const options: RequestInit = { method };
    const headers = new Headers();

    // Add content type for non-GET requests with data
    if (method !== 'GET' && data) {
      headers.set('Content-Type', 'application/json');
      options.body = JSON.stringify(data);
    }

    // Add auth header if token provided
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    options.headers = headers;

    try {
      // Make the request
      const response = await fetch(url, options);

     
      // Success response
      if (response.ok) {
        const data = await response.json();
        return {
          type: 'success',
          data
        };
      }


      if (response.status === 403) {
        const errorMessage = 'Your session has expired. Please sign in again.';
        window.location.href = `/sign-in?error=${encodeURIComponent(errorMessage)}`;
        return {
          type: 'error',
          error: {
            _global: [{
              code: 'unauthorized',
              message: errorMessage,
              params: { status: 403 }
            }]
          }
        };
      }

      if (response.status === 422) {
        try {
          const errorResponse: ApiError = await response.json();
          return {
            type: 'error',
            error: errorResponse
          };
        } catch (e) {
          console.error('Failed to parse validation error response:', e);
          return {
            type: 'error',
            error: {
              _global: [{
                code: 'api_error',
                message: 'An unexpected error occurred',
                params: { status: response.status }
              }]
            }
          };
        }
      }

      // For all other errors (400, 500, etc), return simple error
      return {
        type: 'error',
        error: {
          _global: [{
            code: 'api_error',
            message: null,
            params: { status: response.status }
          }]
        }
      };

    } catch (e) {
      // Handle network or other errors
      return {
        type: 'error',
        error: {
          _global: [{
            code: 'network_error',
            message: null,
            params: { 
              error: e instanceof Error ? e.message : 'Network error'
            }
          }]
        }
      };
    }
  },

  /**
   * GET request
   */
  get: <T>(endpoint: string, token?: string): Promise<ApiResult<T>> => {
    return api.fetch<T>('GET', endpoint, undefined, token);
  },

  /**
   * POST request
   */
  post: <T>(endpoint: string, data: any, token?: string): Promise<ApiResult<T>> => {
    return api.fetch<T>('POST', endpoint, data, token);
  },

  /**
   * PUT request
   */
  put: <T>(endpoint: string, data: any, token?: string): Promise<ApiResult<T>> => {
    return api.fetch<T>('PUT', endpoint, data, token);
  },

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, token?: string): Promise<ApiResult<T>> => {
    return api.fetch<T>('DELETE', endpoint, undefined, token);
  }
};
