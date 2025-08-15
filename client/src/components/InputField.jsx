// src/components/InputField.jsx
import React, { useState } from 'react';
import { Input, Form } from 'antd';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * InputField component with modern styling
 * @param {string} label - Field label
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {string} type - Input type ('text', 'email', 'password', etc.)
 * @param {function} onChange - Change handler
 * @param {any} value - Controlled value
 * @param {ReactNode} prefix - Optional prefix icon or element
 * @param {ReactNode} suffix - Optional suffix icon or element
 * @param {string} size - Input size ('sm', 'md', 'lg')
 * @param {boolean} error - Error state
 * @param {string} errorMessage - Error message
 * @param {boolean} success - Success state
 * @param {string} helperText - Helper text below input
 * @param {object} rest - Other props passed to AntD Input
 */
const InputField = ({
  label,
  placeholder,
  required = false,
  type = 'text',
  onChange,
  value,
  prefix,
  suffix,
  size = 'md',
  error = false,
  errorMessage,
  success = false,
  helperText,
  className = '',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  // Input type for password toggle
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Status classes
  const getStatusClasses = () => {
    if (error) {
      return 'border-error-500 focus:border-error-500 focus:ring-error-500 bg-error-50';
    }
    if (success) {
      return 'border-success-500 focus:border-success-500 focus:ring-success-500 bg-success-50';
    }
    if (isFocused) {
      return 'border-primary-500 focus:border-primary-500 focus:ring-primary-500';
    }
    return 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';
  };

  // Password toggle suffix
  const passwordSuffix = type === 'password' ? (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  ) : null;

  // Status suffix
  const statusSuffix = error ? (
    <AlertCircle className="w-4 h-4 text-error-500" />
  ) : success ? (
    <CheckCircle className="w-4 h-4 text-success-500" />
  ) : null;

  // Final suffix (password toggle takes precedence)
  const finalSuffix = passwordSuffix || statusSuffix || suffix;

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {prefix}
          </div>
        )}

        {/* Input */}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full ${sizeClasses[size]}
            border rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${prefix ? 'pl-10' : ''}
            ${finalSuffix ? 'pr-10' : ''}
            ${getStatusClasses()}
          `}
          {...rest}
        />

        {/* Suffix */}
        {finalSuffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {finalSuffix}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && !error && !errorMessage && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      {/* Error Message */}
      {error && errorMessage && (
        <p className="mt-1 text-sm text-error-600 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </p>
      )}

      {/* Success Message */}
      {success && helperText && (
        <p className="mt-1 text-sm text-success-600 flex items-center space-x-1">
          <CheckCircle className="w-4 h-4" />
          <span>{helperText}</span>
        </p>
      )}
    </div>
  );
};

export default InputField;
