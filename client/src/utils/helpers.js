import { APP_CONFIG } from './constants';

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format date in human readable format
 * @param {Date|string} date - Date to format
 * @param {string} format - Date format (default: 'MMM DD, YYYY')
 * @returns {string} - Formatted date
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return format
    .replace('MMM', month)
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('YYYY', year.toString());
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to get relative time for
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Generate a unique ID
 * @param {number} length - Length of the ID
 * @returns {string} - Unique ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} - Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} - True if object is empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} - Title case string
 */
export const toTitleCase = (str) => {
  if (!str) return str;
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} - Truncated string
 */
export const truncate = (str, length, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Convert bytes to MB
 * @param {number} bytes - Bytes to convert
 * @returns {number} - Megabytes
 */
export const bytesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};

/**
 * Convert MB to bytes
 * @param {number} mb - Megabytes to convert
 * @returns {number} - Bytes
 */
export const mbToBytes = (mb) => {
  return mb * 1024 * 1024;
};

/**
 * Check if file is PDF
 * @param {File|string} file - File or file name to check
 * @returns {boolean} - True if file is PDF
 */
export const isPdfFile = (file) => {
  if (typeof file === 'string') {
    return file.toLowerCase().endsWith('.pdf');
  }
  return file.type === 'application/pdf';
};

/**
 * Get file extension
 * @param {string} filename - File name
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Remove file extension
 * @param {string} filename - File name
 * @returns {string} - File name without extension
 */
export const removeFileExtension = (filename) => {
  return filename.replace(/\.[^/.]+$/, '');
};

/**
 * Generate safe filename
 * @param {string} filename - Original filename
 * @returns {string} - Safe filename
 */
export const generateSafeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Check if browser supports file API
 * @returns {boolean} - True if supported
 */
export const supportsFileAPI = () => {
  return !!(window.File && window.FileReader && window.FileList && window.Blob);
};

/**
 * Check if browser supports drag and drop
 * @returns {boolean} - True if supported
 */
export const supportsDragAndDrop = () => {
  const div = document.createElement('div');
  return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
};

/**
 * Get device type
 * @returns {string} - Device type ('mobile', 'tablet', 'desktop')
 */
export const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  
  if (isMobile && !isTablet) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};

/**
 * Check if device is mobile
 * @returns {boolean} - True if mobile device
 */
export const isMobile = () => {
  return getDeviceType() === 'mobile';
};

/**
 * Check if device is tablet
 * @returns {boolean} - True if tablet device
 */
export const isTablet = () => {
  return getDeviceType() === 'tablet';
};

/**
 * Check if device is desktop
 * @returns {boolean} - True if desktop device
 */
export const isDesktop = () => {
  return getDeviceType() === 'desktop';
};
