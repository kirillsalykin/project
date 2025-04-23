import React, { InputHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// Spinner component for loading states
interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  className = ''
}) => {
  return (
    <span 
      className={`inline-block w-4 h-4 border-2 rounded-full animate-spin mr-2 align-middle border-white/30 border-t-white ${className}`}
      role="status" 
      aria-label="Loading"
    />
  );
};

// Button Components
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  disabled,
  className = '',
  ...rest 
}) => {
  const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium inline-block transition-all duration-200';
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  };
  const disabledClasses = 'opacity-60 cursor-not-allowed hover:shadow-none';
  const loadingOrDisabled = isLoading || disabled;
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${loadingOrDisabled ? disabledClasses : ''} ${className}`}
      disabled={loadingOrDisabled}
      {...rest}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Spinner className="mr-3" />
          <span>Processing...</span>
        </span>
      ) : children}
    </button>
  );
};

// Link Components
interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({ to, children, className = '', ...rest }) => {
  return (
    <RouterLink
      to={to}
      className={`text-sm font-medium text-gray-600 hover:text-gray-900 ${className}`}
      {...rest}
    >
      {children}
    </RouterLink>
  );
};

export const ButtonLink: React.FC<LinkProps & { variant?: 'primary' | 'secondary' }> = ({ 
  to, 
  children, 
  variant = 'primary',
  className = '',
  ...rest 
}) => {
  const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium inline-block';
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
  };
  
  return (
    <RouterLink
      to={to}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </RouterLink>
  );
};

// Form Components
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', ...rest }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
        {...rest}
      />
    </div>
  );
};

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  );
};

// Card Components
interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden w-full ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, className = '' }) => {
  return (
    <div className={`px-8 py-6 text-center ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
  );
};

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-8 pb-8 w-full ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-8 py-6 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-600 ${className}`}>
      {children}
    </div>
  );
};

// Alert Components
interface AlertProps {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  const baseClasses = 'p-3 rounded-md text-sm';
  const typeClasses = {
    error: 'bg-red-50 border border-red-100 text-red-700',
    success: 'bg-green-50 border border-green-100 text-green-700',
    info: 'bg-blue-50 border border-blue-100 text-blue-700',
    warning: 'bg-yellow-50 border border-yellow-100 text-yellow-700'
  };
  
  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      {message}
    </div>
  );
}; 