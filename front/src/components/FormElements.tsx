import { InputHTMLAttributes, ButtonHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, id, ...props }: InputProps) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
        {...props}
      />
    </div>
  );
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ children, isLoading, variant = 'primary', ...props }: ButtonProps) => {
  const baseClasses = "w-full py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors";
  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500"
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
};

interface FormCardProps {
  title: string;
  children: React.ReactNode;
}

export const FormCard = ({ title, children }: FormCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>
      {children}
    </div>
  );
};

interface AlertProps {
  type: 'error' | 'info' | 'success';
  message: string;
}

export const Alert = ({ type, message }: AlertProps) => {
  const colors = {
    error: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    success: 'bg-green-50 text-green-700 border-green-100'
  };

  return (
    <div className={`p-3 mt-4 rounded-md border ${colors[type]}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
};