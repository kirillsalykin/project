import React, { ReactNode, useState } from 'react';
import { UseFormRegister, FieldValues, FieldError, UseFormReturn, useForm, Path } from 'react-hook-form';
import { ZodType } from 'zod';
import { ApiErrorResponse } from '../utils/errors';
import { AuthResult } from '../services/api';
import { Alert } from './UIComponents';

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
  const inputStyles = {
    container: {
      marginBottom: '0.75rem',
      width: '100%'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151'  // Gray 700
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      backgroundColor: '#F9FAFB',  // Gray 50
      border: '1px solid #D1D5DB',  // Gray 300
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      boxSizing: 'border-box' as const
    },
    inputError: {
      borderColor: '#FCA5A5',  // Red 300
    },
    errorText: {
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#DC2626'  // Red 600
    },
    required: {
      color: '#EF4444'  // Red 500
    }
  };
  
  // Add required validation if specified
  if (required && !validation.required) {
    validation.required = `${label} is required`;
  }
  
  return (
    <div style={inputStyles.container}>
      <label htmlFor={id} style={inputStyles.label}>
        {label} {required && <span style={inputStyles.required}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        style={{
          ...inputStyles.input,
          ...(error ? inputStyles.inputError : {})
        }}
        className={className}
        {...register(id, validation)}
      />
      {error && (
        <p style={inputStyles.errorText}>{error.message}</p>
      )}
    </div>
  );
};

// Form error message display
interface FormErrorProps {
  error: string;
}

export const FormError: React.FC<FormErrorProps> = ({ error }) => {
  const errorStyles = {
    container: {
      padding: '0.75rem',
      marginBottom: '1rem',
      fontSize: '0.875rem',
      color: '#B91C1C',  // Red 700
      backgroundColor: '#FEF2F2',  // Red 50
      borderRadius: '0.375rem',
      border: '1px solid #FEE2E2'  // Red 100
    }
  };

  return (
    <div style={errorStyles.container}>
      {error}
    </div>
  );
};

// Form with React Hook Form integration
interface FormProps<TFormValues extends FieldValues> {
  children: ReactNode;
  onSubmit: (data: TFormValues) => Promise<void> | void;
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
  const formStyles = {
    form: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    button: {
      width: '100%',
      padding: '0.5rem 1rem',
      backgroundColor: '#4F46E5', // Indigo primary color
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      marginTop: '0.75rem'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  };

  return (
    <form 
      onSubmit={methods.handleSubmit(onSubmit)} 
      style={{ ...formStyles.form, ...(className ? {} : {}) }}
      className={className}
    >
      {children}
      
      {globalError && <Alert type="error" message={globalError} />}
      
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          ...formStyles.button,
          ...(isSubmitting ? formStyles.buttonDisabled : {})
        }}
      >
        {isSubmitting ? 'Processing...' : submitText}
      </button>
    </form>
  );
};

// Form submit button
interface FormButtonProps {
  isLoading: boolean;
  text: string;
  loadingText?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset'; 
}

export const FormButton: React.FC<FormButtonProps> = ({ 
  isLoading, 
  text, 
  loadingText = 'Processing...', 
  className = '',
  type = 'submit'
}) => {
  return (
    <button
      type={type}
      disabled={isLoading}
      className={`
        w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md 
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
        focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? loadingText : text}
    </button>
  );
};

// Hook for handling API errors in forms
export function useApiErrorHandler<T extends FieldValues>(
  form: UseFormReturn<T>
): {
  handleApiError: (result: AuthResult) => string | null;
  resetErrors: () => void;
} {
  return {
    handleApiError: (result: AuthResult): string | null => {
      // Reset previous errors first
      form.clearErrors();
      
      // Handle field errors if any
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(field as Path<T>, { 
              type: 'server', 
              message: messages[0] 
            });
          }
        });
      }
      
      // Return the global error message if any
      return result.error;
    },
    
    resetErrors: () => {
      form.clearErrors();
    }
  };
}

// Form container with standardized styling and improved layout
export const FormContainer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const containerStyles = {
    width: '100%',
    maxWidth: '28rem',
    margin: '1.5rem auto',
    padding: '0 1rem'
  };
  
  return (
    <div style={containerStyles}>
      {children}
    </div>
  );
};

// Custom hook for form handling with API integration
export function useApiForm<TFormValues extends FieldValues, TResponse>(
  apiMethod: (data: TFormValues) => Promise<AuthResult>,
  onSuccess?: (data: TResponse, result: AuthResult) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const methods = useForm<TFormValues>({
    mode: 'onBlur'
  });
  
  const { handleApiError, resetErrors } = useApiErrorHandler(methods);
  
  const onSubmit = async (data: TFormValues) => {
    setIsSubmitting(true);
    setGlobalError(null);
    resetErrors();
    
    try {
      const result = await apiMethod(data);
      
      if (result.error) {
        // Handle API errors
        const error = handleApiError(result);
        setGlobalError(error);
      } else if (result.token && onSuccess) {
        // Call success handler with the response data
        onSuccess(result.data as TResponse, result);
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