import React, { ReactNode, useState } from 'react';
import { UseFormRegister, FieldValues, FieldError, UseFormReturn, useForm, Path, UseFormSetError, DefaultValues } from 'react-hook-form';
import { ZodType } from 'zod';
import { ApiResult } from '../types/api';
import { Alert, Spinner, Button, Link } from './UIComponents';
import { getErrorMessages } from '../utils/errors';
import { ErrorWithAction } from '../utils/errors';

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
  isSubmitting?: boolean;
  globalError?: ErrorWithAction | null;
  submitText?: string;
  className?: string;
  onError?: (error: ErrorWithAction) => ReactNode;
}

export function Form<TFormValues extends FieldValues>({
  children,
  onSubmit,
  isSubmitting = false,
  globalError = null,
  submitText = 'Submit',
  className = '',
  onError
}: FormProps<TFormValues>) {
  return (
    <form 
      onSubmit={onSubmit}
      className={`space-y-4 ${className}`}
    >
      {children}
      
      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Processing...' : submitText}
      </Button>

      {globalError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-red-700">{globalError.message}</p>
            {globalError.action && (
              <p className="text-sm">
                <Link to={globalError.action.to} className="text-primary font-medium hover:text-primary/80">
                  {globalError.action.label} →
                </Link>
              </p>
            )}
          </div>
        </div>
      )}
    </form>
  );
}

// Form container with standardized styling and improved layout
export const FormContainer: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="max-w-md mx-auto w-full">
      {children}
    </div>
  );
};

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

// Custom hook for form handling with API integration and error management
export function useFormWithApi<TFormValues extends FieldValues, TResponse>(
  apiMethod: (data: TFormValues) => Promise<ApiResult<TResponse>>,
  onSuccess?: (data: TResponse) => void,
  defaultValues?: DefaultValues<TFormValues>,
  onError?: (error: ErrorWithAction, formData: TFormValues) => ErrorWithAction
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<ErrorWithAction | undefined>(undefined);
  
  const form = useForm<TFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues,
    criteriaMode: 'firstError',
    shouldFocusError: true,
    shouldUnregister: false
  });
  
  const { handleApiError, resetErrors } = useApiErrorHandler(form);
  
  const onSubmit = async (data: TFormValues) => {
    setIsSubmitting(true);
    setGlobalError(undefined);
    resetErrors();
    
    try {
      const result = await apiMethod(data);
      
      if (result.type === 'success') {
        onSuccess?.(result.data);
      } else {
        const { globalError: error, fieldErrors } = getErrorMessages(result.error);
        
        // Set field errors
        Object.entries(fieldErrors).forEach(([field, message]) => {
          form.setError(field as Path<TFormValues>, { 
            type: 'server', 
            message 
          });
        });
        
        // Set global error if any
        if (error) {
          setGlobalError(onError ? onError(error, data) : error);
        }
      }
    } catch (err) {
      setGlobalError({ message: 'An unexpected error occurred' });
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    formState: form.formState,
    getValues: form.getValues,
    setValue: form.setValue,
    isSubmitting,
    globalError
  };
}