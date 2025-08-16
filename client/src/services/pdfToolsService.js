import apiService from './apiService';

// Base PDF processing function
const processPdf = async (endpoint, formData) => {
  try {
    const response = await apiService.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Merge PDFs
export const mergePdfs = async (files, options = {}) => {
  const formData = new FormData();
  
  if (Array.isArray(files)) {
    files.forEach((file, index) => {
      formData.append('files', file);
    });
  } else {
    formData.append('file', files);
  }
  
  // Add any additional options
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return processPdf('/pdf/merge', formData);
};

// Split PDF
export const splitPdf = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return processPdf('/pdf/split', formData);
};

// Compress PDF
export const compressPdf = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return processPdf('/pdf/compress', formData);
};

// Convert PDF
export const convertPdf = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return processPdf('/pdf/convert', formData);
};

// Protect PDF
export const protectPdf = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return processPdf('/pdf/protect', formData);
};

// Unlock PDF
export const unlockPdf = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return processPdf('/pdf/unlock', formData);
};

// Rotate PDF
export const rotatePdf = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return processPdf('/pdf/rotate', formData);
};

// Add watermark to PDF
export const addWatermark = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return processPdf('/pdf/watermark', formData);
};

// Add page numbers to PDF
export const addPageNumbers = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.entries(options).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return processPdf('/pdf/page-numbers', formData);
};

// Download processed file
export const downloadFile = async (fileUrl, fileName) => {
  try {
    const response = await apiService.get(fileUrl, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'processed-document.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};
