import { SignUpInput, AuthenticatedResponse } from '../types/api';
import { http, HttpError } from './http';

export interface AuthResult {
  token: string | null;
  error: string | null;
}

// Auth service with real API integration
export const authService = {
  // Sign up with email and password
  signUp: async (email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await http.post<AuthenticatedResponse>('/membership/sign-up', {
        email,
        password,
      } as SignUpInput);
      
      return {
        token: data.token,
        error: null
      };
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Handle specific validation errors (HTTP 400)
      if (error instanceof HttpError && error.status === 400) {
        return {
          token: null,
          error: error.message // This will contain the formatted validation message
        };
      }
      
      // Handle other errors
      return {
        token: null,
        error: error instanceof Error 
          ? error.message 
          : 'Network error, please check your connection'
      };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await http.post<AuthenticatedResponse>('/membership/sign-in', {
        email,
        password,
      } as SignUpInput);
      
      return {
        token: data.token,
        error: null
      };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Handle HTTP errors based on status code
      if (error instanceof HttpError) {
        if (error.status === 400) {
          // Validation error
          return {
            token: null,
            error: error.message
          };
        } else if (error.status === 401) {
          // Unauthorized
          return {
            token: null,
            error: 'Invalid email or password'
          };
        } else if (error.status === 404) {
          // Not found
          return {
            token: null,
            error: 'The requested resource was not found'
          };
        } else if (error.status >= 500) {
          // Server error
          return {
            token: null,
            error: 'Server error, please try again later'
          };
        }
      }
      
      // Default error handling
      return {
        token: null,
        error: error instanceof Error 
          ? error.message 
          : 'Network error, please check your connection'
      };
    }
  },

  // Legacy method for compatibility
  authenticate: async (email: string, password: string = "password"): Promise<AuthResult> => {
    // Use the sign in method for authentication
    return authService.signIn(email, password);
  }
};