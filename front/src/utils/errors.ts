import { messages } from './validation';

export interface ApiError {
  code: string;
  params?: Record<string, any>;
  field?: string;
}

export interface ValidationError extends ApiError {
  code: 'validation_error';
  errors: ApiError[];
}

// Map server error codes to our shared messages
const ERROR_MESSAGES: Record<string, (params: Record<string, any>) => string> = {
  already_exists: () => messages.auth.alreadyExists,
  invalid_credentials: () => messages.auth.invalidCredentials,
  email: () => messages.email.invalid,
  length: (params) => messages.password.min(params.min || 4)
};

const HTTP_ERROR_MESSAGES: Record<string, string> = {
  api_error: messages.auth.unknown,
  network_error: messages.auth.networkError
};

function formatErrorMessage(error: ApiError): string {
  if (error.code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[error.code](error.params || {});
  }
  return HTTP_ERROR_MESSAGES[error.code] || messages.auth.unknown;
}

export function getErrorMessages(error: ApiError): { globalError?: string; fieldErrors?: Record<string, string> } {
  if (error.code === 'validation_error') {
    const validationError = error as ValidationError;
    const fieldErrors: Record<string, string> = {};
    validationError.errors?.forEach((err) => {
      if (err.field) {
        fieldErrors[err.field] = formatErrorMessage(err);
      }
    });
    return { fieldErrors };
  }

  return { globalError: formatErrorMessage(error) };
} 