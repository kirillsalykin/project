import React, { ReactNode } from 'react';
import { UseFormRegister, FieldValues, FieldError, useForm, Path, DefaultValues } from 'react-hook-form';
import { Alert, Spinner, Button, Link } from '../../shared/components/UIComponents';

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

// Form with React Hook Form integration
interface FormProps<TFormValues extends FieldValues> {
  children: ReactNode;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> | void;
  isSubmitting?: boolean;
  submitText?: string;
  className?: string;
}

export function Form<TFormValues extends FieldValues>({
  children,
  onSubmit,
  isSubmitting = false,
  submitText = 'Submit',
  className = ''
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