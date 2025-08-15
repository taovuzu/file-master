import { MESSAGES } from './constants';

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: MESSAGES.VALIDATION.PASSWORD_REQUIRED };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Password confirmation validation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} - Validation result with isValid and message
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: MESSAGES.VALIDATION.PASSWORD_CONFIRM_REQUIRED };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: MESSAGES.VALIDATION.PASSWORD_MISMATCH };
  }
  
  return { isValid: true, message: '' };
};

/**
 * File validation
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result with isValid and message
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedTypes = ['application/pdf'],
    required = true
  } = options;

  if (!file && required) {
    return { isValid: false, message: MESSAGES.VALIDATION.FILE_REQUIRED };
  }

  if (!file) {
    return { isValid: true, message: '' };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: MESSAGES.ERROR.INVALID_FILE_TYPE };
  }

  // Check file size
  if (file.size > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { isValid: false, message: `${MESSAGES.ERROR.FILE_TOO_LARGE}. Maximum size is ${sizeInMB}MB` };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, message: 'File appears to be empty' };
  }

  return { isValid: true, message: '' };
};

/**
 * Multiple files validation
 * @param {File[]} files - Files to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result with isValid and message
 */
export const validateFiles = (files, options = {}) => {
  const {
    minCount = 1,
    maxCount = 10,
    maxSize = 50 * 1024 * 1024,
    allowedTypes = ['application/pdf']
  } = options;

  if (!files || files.length === 0) {
    return { isValid: false, message: MESSAGES.ERROR.NO_FILES_SELECTED };
  }

  if (files.length < minCount) {
    return { isValid: false, message: MESSAGES.VALIDATION.MULTIPLE_FILES_REQUIRED };
  }

  if (files.length > maxCount) {
    return { isValid: false, message: `You can only upload up to ${maxCount} files` };
  }

  // Validate each file
  for (const file of files) {
    const validation = validateFile(file, { maxSize, allowedTypes, required: false });
    if (!validation.isValid) {
      return validation;
    }
  }

  return { isValid: true, message: '' };
};

/**
 * Form validation rules generator
 * @param {string} fieldType - Type of field
 * @param {object} options - Validation options
 * @returns {array} - Array of validation rules
 */
export const getValidationRules = (fieldType, options = {}) => {
  const rules = [];

  switch (fieldType) {
    case 'email':
      rules.push(
        { required: true, message: MESSAGES.VALIDATION.EMAIL_REQUIRED },
        { type: 'email', message: MESSAGES.VALIDATION.EMAIL_INVALID }
      );
      break;

    case 'password':
      rules.push(
        { required: true, message: MESSAGES.VALIDATION.PASSWORD_REQUIRED },
        { min: 6, message: MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH }
      );
      break;

    case 'confirmPassword':
      rules.push(
        { required: true, message: MESSAGES.VALIDATION.PASSWORD_CONFIRM_REQUIRED },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error(MESSAGES.VALIDATION.PASSWORD_MISMATCH));
          },
        })
      );
      break;

    case 'name':
      rules.push({ required: true, message: MESSAGES.VALIDATION.NAME_REQUIRED });
      break;

    case 'required':
      rules.push({ required: true, message: 'This field is required' });
      break;

    default:
      break;
  }

  return rules;
};

/**
 * URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Phone number validation
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Credit card validation (Luhn algorithm)
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} - True if valid card number
 */
export const isValidCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Date validation
 * @param {string} date - Date string to validate
 * @param {string} format - Expected date format (default: YYYY-MM-DD)
 * @returns {boolean} - True if valid date
 */
export const isValidDate = (date, format = 'YYYY-MM-DD') => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Number range validation
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} - True if value is within range
 */
export const isInRange = (value, min, max) => {
  return value >= min && value <= max;
};

/**
 * String length validation
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} - True if string length is within range
 */
export const isValidLength = (str, min, max) => {
  return str.length >= min && str.length <= max;
};
