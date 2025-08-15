import { useState, useCallback } from 'react';
import { message } from 'antd';
import useFileUpload from './useFileUpload';

const usePdfUpload = (options = {}) => {
  const {
    multiple = false,
    maxFiles = multiple ? 10 : 1,
    maxFileSize = 50 * 1024 * 1024, // 50MB default
    showPreview = true,
    ...fileUploadOptions
  } = options;

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const {
    fileList,
    setFileList,
    handleChange,
    resetFiles
  } = useFileUpload({
    multiple,
    accept: ['application/pdf'],
    maxFiles,
    ...fileUploadOptions
  });

  const validateFiles = useCallback((files) => {
    const errors = [];

    files.forEach((file) => {
      // Check file type
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name} is not a valid PDF file`);
      }

      // Check file size
      if (file.size > maxFileSize) {
        const sizeInMB = (maxFileSize / (1024 * 1024)).toFixed(1);
        errors.push(`${file.name} is too large. Maximum size is ${sizeInMB}MB`);
      }

      // Check if file is corrupted or empty
      if (file.size === 0) {
        errors.push(`${file.name} appears to be empty`);
      }
    });

    return errors;
  }, [maxFileSize]);

  const handleFileChange = useCallback((info) => {
    const { file, fileList: newFileList } = info;

    // Validate files before updating state
    const errors = validateFiles(newFileList);
    
    if (errors.length > 0) {
      errors.forEach(error => message.error(error));
      return;
    }

    // Call the original handleChange
    handleChange(info);
  }, [handleChange, validateFiles]);

  const uploadFiles = useCallback(async (uploadFunction, additionalData = {}) => {
    if (!fileList || fileList.length === 0) {
      message.warning('Please select files to upload');
      return { success: false, message: 'No files selected' };
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (multiple) {
        fileList.forEach((file) => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', fileList[0]);
      }

      // Add additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      // Simulate upload progress (remove this in production)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadFunction(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result?.success) {
        message.success('Files uploaded successfully!');
        return { success: true, data: result.data };
      } else {
        message.error(result?.message || 'Upload failed');
        return { success: false, message: result?.message };
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('An unexpected error occurred during upload');
      return { success: false, message: 'Upload failed' };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [fileList, multiple]);

  const getFileInfo = useCallback(() => {
    if (!fileList || fileList.length === 0) return null;

    const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

    return {
      count: fileList.length,
      totalSize,
      sizeInMB,
      files: fileList.map(file => ({
        name: file.name,
        size: file.size,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type
      }))
    };
  }, [fileList]);

  return {
    // File state
    fileList,
    setFileList,
    resetFiles,
    
    // Upload state
    isUploading,
    uploadProgress,
    
    // Handlers
    handleChange: handleFileChange,
    uploadFiles,
    
    // Utilities
    getFileInfo,
    validateFiles,
    
    // Configuration
    multiple,
    maxFiles,
    maxFileSize,
    showPreview
  };
};

export default usePdfUpload;
