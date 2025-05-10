
export const APP_CONFIG = {

  name: 'FileMaster PDF Tools',
  version: '1.0.0',
  description: 'Professional PDF processing tools for all your needs',


  api: {
    baseURL: import.meta.env.VITE_APP_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT || 30000),
    retryAttempts: Number(import.meta.env.VITE_API_RETRY_ATTEMPTS || 3)
  },


  upload: {
    maxFileSize: 50 * 1024 * 1024,
    allowedTypes: ['application/pdf'],
    maxFiles: 10,
    chunkSize: 1024 * 1024
  },


  pdf: {
    maxPages: 1000,
    supportedFormats: ['docx', 'xlsx', 'jpg', 'png', 'txt'],
    compressionLevels: ['low', 'medium', 'high'],
    rotationAngles: [90, 180, 270]
  },


  ui: {
    theme: {
      primaryColor: '#1890ff',
      borderRadius: 6,
      fontSize: 14
    },
    layout: {
      headerHeight: 64,
      sidebarWidth: 200,
      contentPadding: 24
    },
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true
    }
  },


  features: {
    googleAuth: true,
    filePreview: true,
    batchProcessing: true,
    analytics: true,
    notifications: true
  },


  routes: {
    public: ['/login', '/register', '/forgot-password'],
    protected: ['/profile', '/download'],
    admin: ['/admin', '/analytics']
  },


  messages: {
    errors: {
      fileTooLarge: 'File size exceeds the maximum limit of 50MB',
      invalidFileType: 'Only PDF files are allowed',
      uploadFailed: 'File upload failed. Please try again.',
      processingFailed: 'PDF processing failed. Please try again.',
      networkError: 'Network error. Please check your connection.',
      unauthorized: 'You are not authorized to perform this action.'
    },
    success: {
      uploadSuccess: 'File uploaded successfully',
      processingSuccess: 'PDF processed successfully',
      profileUpdated: 'Profile updated successfully',
      passwordChanged: 'Password changed successfully'
    }
  },


  validation: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      required: true,
      minLength: 6,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    },
    name: {
      required: true,
      minLength: 2,
      maxLength: 50
    }
  }
};


export const getConfig = () => {
  const env = import.meta.env.MODE;

  return {
    ...APP_CONFIG,
    features: {
      ...APP_CONFIG.features,
      analytics: import.meta.env.VITE_FEATURE_ANALYTICS === 'true' || env === 'production'
    }
  };
};

export default getConfig();