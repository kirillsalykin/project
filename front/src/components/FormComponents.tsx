import React, { ReactNode, useState } from 'react';
import { UseFormRegister, FieldValues, FieldError, UseFormReturn, useForm, Path } from 'react-hook-form';
import { ZodType } from 'zod';
import { ApiError } from '../utils/errors';
import { ApiResult } from '../services/http';
import { Alert } from './UIComponents';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles';

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
      marginBottom: spacing[3],
      width: '100%'
    },
    label: {
      display: 'block',
      marginBottom: spacing[1],
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.gray[700]
    },
    input: {
      width: '100%',
      padding: `${spacing[2]} ${spacing[3]}`,
      backgroundColor: colors.gray[50],
      border: `1px solid ${colors.gray[300]}`,
      borderRadius: borderRadius.md,
      fontSize: fontSizes.sm,
      boxSizing: 'border-box' as const
    },
    inputError: {
      borderColor: colors.red[100]
    },
    errorText: {
      marginTop: spacing[1],
      fontSize: fontSizes.xs,
      color: colors.red[700]
    },
    required: {
      color: colors.red[700]
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
      padding: spacing[3],
      marginBottom: spacing[4],
      fontSize: fontSizes.sm,
      color: colors.red[700],
      backgroundColor: colors.red[50],
      borderRadius: borderRadius.md,
      border: `1px solid ${colors.red[100]}`
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
      gap: spacing[2]
    },
    button: {
      width: '100%',
      padding: `${spacing[2]} ${spacing[4]}`,
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: borderRadius.md,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      cursor: 'pointer',
      marginTop: spacing[3]
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
  const containerStyles = {
    width: '100%',
    maxWidth: '28rem',
    margin: `${spacing[6]} auto`,
    padding: `0 ${spacing[4]}`
  };
  
  return (
    <div style={containerStyles}>
      {children}
    </div>
  );
};

// Custom hook for form handling with API integration
export function useApiForm<TFormValues extends FieldValues, TResponse>(
  apiMethod: (data: TFormValues) => Promise<ApiResult<TResponse>>,
  onSuccess?: (data: TResponse) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);
  
  const methods = useForm<TFormValues>({
    mode: 'onBlur'
  });
  
  const { handleApiError, resetErrors } = useApiErrorHandler(methods);
  
  const onSubmit = async (data: TFormValues) => {
    setIsSubmitting(true);
    setGlobalError(undefined);
    resetErrors();
    
    try {
      const result = await apiMethod(data);
      
      // Check if it's a success response (has data property)
      if ('data' in result) {
        // Success case
        if (onSuccess && result.data) {
          onSuccess(result.data);
        }
      } else {
        // Error case - no data property means it's an ApiError
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