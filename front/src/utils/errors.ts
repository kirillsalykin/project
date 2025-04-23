import { messages } from './validation';
import { ApiError } from '../services/api';

export interface ValidationError {
  code: 'validation_error';
  errors: Array<{
    code: string;
    message: string | null;
    field?: string;
  }>;
}

export interface ErrorWithAction {
  message: string;
  code?: string;
  action?: {
    label: string;
    to: string;
  };
}

// Map server error codes to our shared messages
const ERROR_MESSAGES: Record<string, (params: Record<string, any>) => string> = {
  invalid_credentials: () => messages.auth.invalidCredentials,
  email: () => messages.email.invalid,
  length: (params) => messages.password.min(params.min || 4)
};

const HTTP_ERROR_MESSAGES: Record<string, string> = {
  api_error: messages.auth.unknown,
  network_error: messages.auth.networkError
};

function formatErrorMessage(error: { code: string; message: string | null; params?: Record<string, any> }): string {
  // Use the original error message if it exists
  if (error.message) {
    return error.message;
  }
  
  // Fall back to mapped messages
  if (error.code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[error.code](error.params || {});
  }
  return HTTP_ERROR_MESSAGES[error.code] || messages.auth.unknown;
}

export function getErrorMessages(error: ApiError): { globalError?: string; fieldErrors?: Record<string, string> } {
  const { _global, ...fieldErrors } = error;
  
  if (_global) {
    return { globalError: formatErrorMessage(_global[0]) };
  }

  const formattedErrors: Record<string, string> = {};
  Object.entries(fieldErrors).forEach(([field, fieldError]) => {
    if (fieldError) {
      formattedErrors[field] = formatErrorMessage(fieldError[0]);
    }
  });

  return { fieldErrors: formattedErrors };
} 