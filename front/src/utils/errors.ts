import { FieldValues, Path, UseFormSetError } from "react-hook-form";

/**
 * Base API response interface
 */
export interface ApiResponse {
  statusCode?: number;  // HTTP status code
}

/**
 * Interface for standardized API error format
 */
export interface ApiError extends ApiResponse {
  error?: string;                       // Primary error message 
  fieldErrors?: Record<string, string>; // Field-specific validation errors (single message per field)
}

// We don't need a parser function - TypeScript handles the types for us
// and the backend returns data in the expected format

/**
 * Sets form errors from API error response using react-hook-form's setError
 */
export function setFormErrors<T extends FieldValues>(
  apiError: ApiError,
  setError: UseFormSetError<T>,
  setGlobalError?: (error: string) => void
): void {
  // Set field-specific errors
  if (apiError.fieldErrors) {
    Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
      if (message) {
        setError(field as Path<T>, { 
          type: 'server', 
          message: message
        });
      }
    });
  }

  // Set global error if handler provided
  if (setGlobalError && apiError.error) {
    setGlobalError(apiError.error);
  }
}