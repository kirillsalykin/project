import { SignUpInput, AuthenticatedResponse } from '../types/api';

const API_URL = 'http://localhost:8000';

/**
 * API response type
 */
export type ApiResponseType = 'success' | 'error';

/**
 * Base API response interface
 */
export interface ApiResponse {
  type: ApiResponseType;
  statusCode?: number;  // HTTP status code
}

/**
 * Interface for standardized API error format
 */
export interface ApiError extends ApiResponse {
  type: 'error';
  error: string;                        // Primary error message
  fieldErrors?: Record<string, string>; // Field-specific validation errors
}

/**
 * Success response interface with data
 */
export interface ApiSuccess<T> extends ApiResponse {
  type: 'success';
  data: T;
}

/**
 * Standard API result interface - can be success or error
 */
export type ApiResult<T> = ApiSuccess<T> | ApiError;

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
          statusCode: response.status,
          data
        };
      }

      // Error response
      const status = response.status;
      let error: string = 'An unknown error occurred';
      let fieldErrors = {};

      // Try to parse error response
      if (response.headers.get('content-type')?.includes('application/json')) {
        try {
          const errorData = await response.json();
          error = errorData.error || error;
          fieldErrors = errorData.fieldErrors || {};
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
      }

      return {
        type: 'error',
        statusCode: status,
        error,
        fieldErrors
      };
    } catch (e) {
      // Handle network or other errors
      const error = e instanceof Error ? e.message : 'Network error';
      return {
        type: 'error',
        error,
        statusCode: 0
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
