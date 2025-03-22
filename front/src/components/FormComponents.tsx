import React, { ReactNode, useState } from 'react';
import { UseFormRegister, FieldValues, FieldError, UseFormReturn, useForm, Path, UseFormSetError, DefaultValues } from 'react-hook-form';
import { ZodType } from 'zod';
import { ApiError } from '../services/api';
import { ApiResult } from '../types/api';
import { Alert, Spinner, Button } from './UIComponents';

// Form input with error display
interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  className?: string;
  required?: boolean;
  validation?: Record<string, any>;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  id, 
  label, 
  type = 'text', 
  placeholder,
  register, 
  error, 
  className = '',
  required = false,
  validation = {}
}) => {
  // Add required validation if specified
  if (required && !validation.required) {
    validation.required = `${label} is required`;
  }
  
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-700">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-colors duration-200
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary'
          } ${className}`}
        {...register(id, validation)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p 
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm text-red-600 transition-all duration-200"
        >
          {error.message}
        </p>
      )}
    </div>
  );
};

// Form error message display
interface FormErrorProps {
  error: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error }) => {
  return (
    <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-md border border-red-100">
      {error}
    </div>
  );
};

// Form with React Hook Form integration
interface FormProps<TFormValues extends FieldValues> {
  children: ReactNode;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> | void;
  methods: UseFormReturn<TFormValues>;
  isSubmitting?: boolean;
  globalError?: string | null;
  submitText?: string;
  className?: string;
}

export function Form<TFormValues extends FieldValues>({
  children,
  onSubmit,
  methods,
  isSubmitting = false,
  globalError = null,
  submitText = 'Submit',
  className = ''
}: FormProps<TFormValues>) {
  return (
    <form 
      onSubmit={onSubmit}
      className={`space-y-4 ${className}`}
    >
      {children}
      
      {globalError && <Alert type="error" message={globalError} />}
      
      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        className="w-full mt-4"
      >
        {isSubmitting ? 'Processing...' : submitText}
      </Button>
    </form>
  );
}

// Generic interface for any object with potential field errors
interface ErrorWithFields {
  error?: string;
  fieldErrors?: Record<string, string>;
}

// Hook for handling API errors in forms
export function useApiErrorHandler<T extends FieldValues>(
  form: UseFormReturn<T>
): {
  handleApiError: <E extends ErrorWithFields>(error: E) => string | undefined;
  resetErrors: () => void;
} {
  return {
    handleApiError: <E extends ErrorWithFields>(error: E): string | undefined => {
      // Reset previous errors first
      form.clearErrors();
      
      // Handle field errors if any
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          if (message) {
            form.setError(field as Path<T>, { 
              type: 'server', 
              message: message 
            });
          }
        });
      }
      
      // Return the error message
      return error.error;
    },
    
    resetErrors: () => {
      form.clearErrors();
    }
  };
}

// Form container with standardized styling and improved layout
export const FormContainer: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="max-w-md mx-auto w-full">
      {children}
    </div>
  );
};

// Custom hook for form handling with API integration and error management
export function useFormWithApi<TFormValues extends FieldValues, TResponse>(
  apiMethod: (data: TFormValues) => Promise<ApiResult<TResponse>>,
  onSuccess?: (data: TResponse) => void,
  defaultValues?: DefaultValues<TFormValues>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  
  const methods = useForm<TFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues,
    criteriaMode: 'firstError',
    shouldFocusError: true,
    shouldUnregister: false
  });
  
  const { handleApiError, resetErrors } = useApiErrorHandler(methods);
  
  const onSubmit = async (data: TFormValues) => {
    setIsSubmitting(true);
    setGlobalError(undefined);
    resetErrors();
    
    try {
      const result = await apiMethod(data);
      
      // Type guard for success case
      if (result.type === 'success') {
        onSuccess?.(result.data);
      } else {
        // Error case
        const errorMessage = handleApiError(result);
        setGlobalError(errorMessage);
      }
    } catch (err) {
      setGlobalError('An unexpected error occurred');
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    methods,
    isSubmitting,
    globalError,
    setGlobalError,
    handleSubmit: methods.handleSubmit(onSubmit)
  };
}