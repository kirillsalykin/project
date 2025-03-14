import { SignUpInput, AuthenticatedResponse } from '../types/api';
import { http, ApiResult, ApiSuccess } from './http';
import { ApiError } from '../utils/errors';

// Map of status codes to custom error messages
const ERROR_MESSAGES: Record<number, string> = {
  401: 'Invalid email or password',
  404: 'Account not found',
  422: 'Please check your input',
  429: 'Too many attempts, please try again later',
  500: 'Server error, please try again later'
};

// Auth service with real API integration
export const authService = {
  // Generic method for auth operations
  authRequest: async (endpoint: string, email: string, password: string): Promise<AuthResult> => {
    const result = await http.request<AuthenticatedResponse>('POST', endpoint, {
      email,
      password,
    } as SignUpInput);
    
    if (result.error) {
      // Customize error messages based on HTTP status if available
      const errorMessage = result.statusCode && ERROR_MESSAGES[result.statusCode] 
        ? ERROR_MESSAGES[result.statusCode]
        : result.error;
      
      return {
        token: null,
        error: errorMessage,
        fieldErrors: result.fieldErrors
      };
    }
    
    return {
      token: result.data?.token || null,
      error: null
    };
  },
  
  // Sign up with email and password
  signUp: async (email: string, password: string): Promise<AuthResult> => {
    return authService.authRequest('/membership/sign-up', email, password);
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    return authService.authRequest('/membership/sign-in', email, password);
  },

  // Legacy method for compatibility
  authenticate: async (email: string, password: string = "password"): Promise<AuthResult> => {
    return authService.signIn(email, password);
  }
};