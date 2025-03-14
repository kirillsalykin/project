import React, { ReactNode } from 'react';
import { UseFormRegister, FieldValues, FieldError, UseFormReturn } from 'react-hook-form';
import { ZodType } from 'zod';
import { ApiErrorResponse } from '../utils/errors';

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
}

export const FormInput: React.FC<FormInputProps> = ({ 
  id, 
  label, 
  type = 'text', 
  placeholder,
  register, 
  error, 
  className = '',
  required = false
}) => {
  const baseInputStyles = `
    w-full px-3 py-2 border rounded-md 
    bg-gray-50 focus:bg-white focus:outline-none 
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  `;
  
  const errorInputStyles = 'border-red-300 focus:border-red-500 focus:ring-red-500';
  
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`${baseInputStyles} ${error ? errorInputStyles : 'border-gray-300'} ${className}`}
        {...register(id)}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
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

// Global errors display
interface GlobalErrorsProps {
  errors: string[];
}

export const GlobalErrors: React.FC<GlobalErrorsProps> = ({ errors }) => {
  if (errors.length === 0) return null;
  
  return (
    <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-md">
      {errors.length === 1 ? (
        <p className="text-sm text-red-700">{errors[0]}</p>
      ) : (
        <ul className="list-disc pl-5 text-sm text-red-700">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
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
  handleApiError: (error: any) => ApiErrorResponse;
} {
  return {
    handleApiError: (error: any): ApiErrorResponse => {
      let apiError: ApiErrorResponse;
      
      if (error instanceof Error && 'apiError' in error) {
        apiError = (error as any).apiError;
      } else {
        // Create a default error if the structure doesn't match
        apiError = {
          globalErrors: [error instanceof Error ? error.message : 'An unexpected error occurred']
        };
      }
      
      // Set field errors on the form
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(field as any, { 
              type: 'server', 
              message: messages[0] 
            });
          }
        });
      }
      
      return apiError;
    }
  };
}