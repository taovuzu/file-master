import { APP_CONFIG } from './constants';







export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};







export const formatDate = (date, format = 'MMM DD, YYYY') => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return format.
  replace('MMM', month).
  replace('DD', day.toString().padStart(2, '0')).
  replace('YYYY', year.toString());
};






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






export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};







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






export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
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






export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};






export const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};






export const toTitleCase = (str) => {
  if (!str) return str;
  return str.replace(/\w\S*/g, (txt) =>
  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};








export const truncate = (str, length, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + suffix;
};






export const getInitials = (name) => {
  if (!name) return '';
  return name.
  split(' ').
  map((word) => word.charAt(0)).
  join('').
  toUpperCase().
  slice(0, 2);
};






export const bytesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};






export const mbToBytes = (mb) => {
  return mb * 1024 * 1024;
};






export const isPdfFile = (file) => {
  if (typeof file === 'string') {
    return file.toLowerCase().endsWith('.pdf');
  }
  return file.type === 'application/pdf';
};






export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};






export const removeFileExtension = (filename) => {
  return filename.replace(/\.[^/.]+$/, '');
};






export const generateSafeFilename = (filename) => {
  return filename.
  replace(/[^a-zA-Z0-9.-]/g, '_').
  replace(/_+/g, '_').
  replace(/^_|_$/g, '');
};





export const supportsFileAPI = () => {
  return !!(window.File && window.FileReader && window.FileList && window.Blob);
};





export const supportsDragAndDrop = () => {
  const div = document.createElement('div');
  return 'draggable' in div || 'ondragstart' in div && 'ondrop' in div;
};





export const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);

  if (isMobile && !isTablet) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};





export const isMobile = () => {
  return getDeviceType() === 'mobile';
};





export const isTablet = () => {
  return getDeviceType() === 'tablet';
};





export const isDesktop = () => {
  return getDeviceType() === 'desktop';
};