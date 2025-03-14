import { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Interface for standardized API error responses
 */
export interface ApiErrorResponse {
  fieldErrors?: Record<string, string[]>;  // Field-specific validation errors
  globalErrors?: string[];                 // Form-level/general errors
}

/**
 * Checks if the response object matches our API error response structure
 */
export function isApiErrorResponse(obj: any): obj is ApiErrorResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (
      (obj.fieldErrors !== undefined && typeof obj.fieldErrors === 'object') ||
      (obj.globalErrors !== undefined && Array.isArray(obj.globalErrors))
    )
  );
}

/**
 * Parses error response into our standardized ApiErrorResponse format
 */
export function parseApiError(error: any): ApiErrorResponse {
  // If it's already in our format, return it
  if (isApiErrorResponse(error)) {
    return error;
  }

  const result: ApiErrorResponse = {
    fieldErrors: {},
    globalErrors: []
  };

  // Handle error response
  if (error) {
    // Handle field errors directly
    if (error.fieldErrors && typeof error.fieldErrors === 'object') {
      result.fieldErrors = error.fieldErrors;
    }
    
    // Handle global errors directly
    if (error.globalErrors && Array.isArray(error.globalErrors)) {
      result.globalErrors = error.globalErrors;
    }
    // Handle simple error message
    else if (error.message) {
      result.globalErrors!.push(error.message);
    }
    // Handle string error
    else if (typeof error === 'string') {
      result.globalErrors!.push(error);
    }
    // Handle unknown error format
    else {
      result.globalErrors!.push('An unexpected error occurred');
    }
  }

  return result;
}

/**
 * Sets form errors from API error response using react-hook-form's setError
 */
export function setFormErrors<T extends FieldValues>(
  apiError: ApiErrorResponse,
  setError: UseFormSetError<T>,
  setGlobalErrors?: (errors: string[]) => void
): void {
  // Set field-specific errors
  if (apiError.fieldErrors) {
    Object.entries(apiError.fieldErrors).forEach(([field, messages]) => {
      if (messages && messages.length > 0) {
        setError(field as Path<T>, { 
          type: 'server', 
          message: messages[0]  // Use first error as the main message
        });
      }
    });
  }

  // Set global errors if handler provided
  if (setGlobalErrors && apiError.globalErrors && apiError.globalErrors.length > 0) {
    setGlobalErrors(apiError.globalErrors);
  }
}