// frontend/components/common/Button.tsx

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils'; // cn関数をインポート

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'default', 
  loading = false, 
  className, 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  }[variant];

  const sizeStyles = {
    default: "px-4 py-2 text-base",
    sm: "px-3 py-1.5 text-sm",
    lg: "px-6 py-3 text-lg",
  }[size];

  return (
    <button
      className={cn(baseStyles, variantStyles, sizeStyles, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

export default Button;