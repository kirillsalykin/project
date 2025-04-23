import { SignUpInput, AuthenticatedResponse } from '../types/api';
import { ApiError as BindingsApiError, ErrorEntry } from '../bindings';

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
  | { type: 'error'; error: ApiError | BindingsApiError };

function isBindingsError(error: any): error is BindingsApiError {
  return 'type' in error;
}

function isServiceError(error: any): error is ApiError {
  return '_global' in error;
}

function isErrorEntry(error: any): error is ErrorEntry {
  return error && typeof error === 'object' && 'code' in error && 'params' in error;
}

function getGlobalErrorCode(error: any): string | undefined {
  if (isErrorEntry(error)) {
    return error.code;
  }
  if (Array.isArray(error)) {
    const firstError = error[0];
    return isErrorEntry(firstError) ? firstError.code : undefined;
  }
  return undefined;
}

export function getErrorMessage(error: BindingsApiError | ApiError): string {
  if (isBindingsError(error)) {
    switch (error.type) {
      case 'UnprocessableEntity':
        return getGlobalErrorCode(error.error.global) || 'Validation error';
      case 'Unauthorized':
        return 'Unauthorized';
      case 'InternalError':
        return 'Internal server error';
      default:
        return 'An unexpected error occurred';
    }
  }

  if (isServiceError(error) && error._global && error._global.length > 0) {
    return error._global[0].message || error._global[0].code || 'An unexpected error occurred';
  }

  return 'An unexpected error occurred';
}

function handleAuthError(message: string) {
  const errorMessage = encodeURIComponent(message);
  window.location.href = `/sign-in?error=${errorMessage}`;
  return {
    type: 'error' as const,
    error: {
      _global: [{
        code: 'unauthorized',
        message: message,
        params: { status: 403 }
      }]
    }
  };
}

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
        return handleAuthError('Your session has expired. Please sign in again.');
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

    } catch (error) {
      if (error instanceof Response) {
        if (error.status === 403) {
          return handleAuthError('Your session has expired. Please sign in again.');
        }

        const errorResponse = await error.json();
        if (error.status === 422) {
          throw errorResponse;
        }

        // For other errors, preserve the original message if available
        if (errorResponse._global && errorResponse._global.length > 0) {
          throw errorResponse;
        }

        throw {
          _global: [{
            code: 'internal_error',
            message: 'An unexpected error occurred',
            params: {}
          }]
        };
      }

      // For network errors or other non-Response errors
      throw {
        _global: [{
          code: 'network_error',
          message: 'A network error occurred',
          params: {}
        }]
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