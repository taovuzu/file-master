// src/components/Button.jsx
import React from 'react';
import { Button as AntButton } from 'antd';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component with modern styling
 * @param {string} variant - 'primary', 'secondary', 'success', 'warning', 'error', 'ghost', 'outline'
 * @param {string} size - 'sm', 'md', 'lg', 'xl'
 * @param {ReactNode} icon - optional icon
 * @param {ReactNode} iconRight - optional right icon
 * @param {boolean} loading - loading state
 * @param {boolean} block - full width
 * @param {boolean} rounded - rounded corners
 * @param {boolean} gradient - gradient background
 * @param {function} onClick - click handler
 * @param {string} children - button text
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  block = false,
  rounded = false,
  gradient = false,
  onClick,
  children,
  className = '',
  disabled = false,
  ...rest
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  // Variant classes
  const variantClasses = {
    primary: gradient 
      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-soft hover:shadow-glow'
      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-medium',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
    success: 'bg-success-600 text-white hover:bg-success-700 shadow-soft hover:shadow-medium',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 shadow-soft hover:shadow-medium',
    error: 'bg-error-600 text-white hover:bg-error-700 shadow-soft hover:shadow-medium',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
    outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50',
  };

  // Base classes
  const baseClasses = `
    inline-flex items-center justify-center font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${block ? 'w-full' : ''}
    ${rounded ? 'rounded-full' : 'rounded-lg'}
    ${className}
  `;

  // Focus ring color based on variant
  const focusRingColor = {
    primary: 'focus:ring-primary-500',
    secondary: 'focus:ring-gray-500',
    success: 'focus:ring-success-500',
    warning: 'focus:ring-warning-500',
    error: 'focus:ring-error-500',
    ghost: 'focus:ring-gray-500',
    outline: 'focus:ring-primary-500',
  };

  const finalClasses = `${baseClasses} ${focusRingColor[variant]}`;

  return (
    <button
      className={finalClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}

      {/* Left icon */}
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}

      {/* Button text */}
      <span>{children}</span>

      {/* Right icon */}
      {iconRight && (
        <span className="ml-2">{iconRight}</span>
      )}
    </button>
  );
};

export default Button;
