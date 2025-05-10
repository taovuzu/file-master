
export const APP_CONFIG = {
  NAME: 'FileMaster',
  VERSION: '1.0.0',
  DESCRIPTION: 'Professional PDF processing tools',
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  SUPPORTED_FORMATS: ['application/pdf'],
  API_TIMEOUT: 30000
};


export const PDF_OPERATIONS = {
  MERGE: 'merge',
  SPLIT: 'split',
  COMPRESS: 'compress',
  CONVERT: 'convert',
  PROTECT: 'protect',
  UNLOCK: 'unlock',
  ROTATE: 'rotate',
  WATERMARK: 'watermark',
  PAGE_NUMBERS: 'pageNumbers'
};


export const FORM_TYPES = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGET_PASSWORD: 'forgetPassword',
  RESET_PASSWORD: 'resetPassword',
  COMPRESS: 'compress',
  PROTECT: 'protect',
  UNLOCK: 'unlock',
  SPLIT: 'split',
  CONVERT: 'convert',
  WATERMARK: 'watermark',
  ROTATE: 'rotate',
  PAGE_NUMBERS: 'pageNumbers'
};


export const COMPRESSION_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};


export const ROTATION_ANGLES = {
  NINETY: '90',
  ONE_EIGHTY: '180',
  TWO_SEVENTY: '270'
};


export const WATERMARK_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  CENTER_LEFT: 'center-left',
  CENTER: 'center',
  CENTER_RIGHT: 'center-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right'
};


export const PAGE_NUMBER_FORMATS = {
  NUMERIC: '1',
  ROMAN_LOWER: 'i',
  ROMAN_UPPER: 'I',
  ALPHA_LOWER: 'a',
  ALPHA_UPPER: 'A'
};


export const CONVERT_FORMATS = {
  DOCX: 'docx',
  XLSX: 'xlsx',
  JPG: 'jpg',
  PNG: 'png'
};


export const SPLIT_METHODS = {
  PAGES: 'pages',
  RANGE: 'range',
  COUNT: 'count'
};


export const UI_CONFIG = {
  BREAKPOINTS: {
    XS: 480,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
    XXL: 1600
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48
  },
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16
  },
  SHADOWS: {
    SM: '0 2px 4px rgba(0, 0, 0, 0.1)',
    MD: '0 4px 8px rgba(0, 0, 0, 0.1)',
    LG: '0 8px 16px rgba(0, 0, 0, 0.1)',
    XL: '0 16px 32px rgba(0, 0, 0, 0.1)'
  }
};


export const COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#ff4d4f',
  INFO: '#1890ff',
  TEXT_PRIMARY: '#262626',
  TEXT_SECONDARY: '#8c8c8c',
  BORDER: '#d9d9d9',
  BACKGROUND: '#f5f5f5',
  WHITE: '#ffffff'
};


export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful!',
    REGISTER: 'Registration successful! Please check your email to verify your account.',
    LOGOUT: 'Logged out successfully',
    PASSWORD_RESET: 'Password reset link sent to your email!',
    PASSWORD_CHANGED: 'Password reset successful!',
    FILE_UPLOADED: 'Files uploaded successfully!',
    PDF_PROCESSED: 'PDF processed successfully!',
    DOWNLOAD_STARTED: 'Download started'
  },
  ERROR: {
    LOGIN_FAILED: 'Login failed',
    REGISTER_FAILED: 'Registration failed',
    LOGOUT_FAILED: 'Logout failed',
    PASSWORD_RESET_FAILED: 'Failed to send reset link',
    PASSWORD_CHANGE_FAILED: 'Password reset failed',
    FILE_UPLOAD_FAILED: 'Upload failed',
    PDF_PROCESS_FAILED: 'PDF processing failed',
    NO_FILES_SELECTED: 'No files selected',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_TOO_LARGE: 'File is too large',
    UNEXPECTED_ERROR: 'An unexpected error occurred'
  },
  VALIDATION: {
    EMAIL_REQUIRED: 'Please enter your email!',
    EMAIL_INVALID: 'Please enter a valid email!',
    PASSWORD_REQUIRED: 'Please enter your password!',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters!',
    PASSWORD_CONFIRM_REQUIRED: 'Please confirm your password!',
    PASSWORD_MISMATCH: 'Passwords do not match!',
    NAME_REQUIRED: 'Please enter your full name!',
    FILE_REQUIRED: 'Please upload a file!',
    MULTIPLE_FILES_REQUIRED: 'Please upload at least two files!'
  }
};


export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },
  PDF: {
    MERGE: '/pdf/merge',
    SPLIT: '/pdf/split',
    COMPRESS: '/pdf/compress',
    CONVERT: '/pdf/convert',
    PROTECT: '/pdf/protect',
    UNLOCK: '/pdf/unlock',
    ROTATE: '/pdf/rotate',
    WATERMARK: '/pdf/watermark',
    PAGE_NUMBERS: '/pdf/page-numbers'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile/update',
    CHANGE_PASSWORD: '/user/change-password'
  }
};




export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  MERGE: '/merge',
  SPLIT: '/split',
  COMPRESS: '/compress',
  CONVERT: '/convert',
  PROTECT: '/protect',
  UNLOCK: '/unlock',
  ROTATE: '/rotate',
  WATERMARK: '/watermark',
  PAGE_NUMBERS: '/page-numbers',
  DOWNLOAD: '/download',
  NOT_FOUND: '*'
};