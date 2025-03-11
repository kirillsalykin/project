import React, { InputHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { buttonStyles, formStyles, cardStyles, alertStyles } from '../styles';

// Button Components
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  disabled, 
  style,
  ...rest 
}) => {
  const baseStyle = variant === 'primary' ? buttonStyles.primary : buttonStyles.secondary;
  const loadingOrDisabled = isLoading || disabled;
  
  return (
    <button
      style={{
        ...baseStyle,
        ...(loadingOrDisabled ? buttonStyles.disabled : {}),
        ...style
      }}
      disabled={loadingOrDisabled}
      {...rest}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
};

// Link Components
interface LinkProps {
  to: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export const Link: React.FC<LinkProps> = ({ to, children, style, ...rest }) => {
  return (
    <RouterLink
      to={to}
      style={{ ...buttonStyles.link, ...style }}
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
  style,
  ...rest 
}) => {
  const baseStyle = variant === 'primary' ? buttonStyles.primary : buttonStyles.secondary;
  
  return (
    <RouterLink
      to={to}
      style={{ ...baseStyle, ...style }}
      {...rest}
    >
      {children}
    </RouterLink>
  );
};

// Form Components
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, style, ...rest }) => {
  return (
    <div style={formStyles.formGroup}>
      <label htmlFor={id} style={formStyles.label}>{label}</label>
      <input
        id={id}
        style={{ ...formStyles.input, ...style }}
        {...rest}
      />
    </div>
  );
};

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  style?: React.CSSProperties;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children, style }) => {
  return (
    <form onSubmit={onSubmit} style={{ ...formStyles.form, ...style }}>
      {children}
    </form>
  );
};

// Card Components
interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return (
    <div style={{ ...cardStyles.card, ...style }}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  style?: React.CSSProperties;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, style }) => {
  return (
    <div style={{ ...cardStyles.cardHeader, ...style }}>
      <h2 style={cardStyles.cardTitle}>{title}</h2>
    </div>
  );
};

interface CardBodyProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, style }) => {
  return (
    <div style={{ ...cardStyles.cardBody, ...style }}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return (
    <div style={{ ...cardStyles.cardFooter, ...style }}>
      {children}
    </div>
  );
};

// Alert Components
interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({ type, message, style }) => {
  const alertStyle = alertStyles[type];
  
  return (
    <div style={{ ...alertStyle, ...style }}>
      {message}
    </div>
  );
};