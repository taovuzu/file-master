import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, AlertCircle, CheckCircle, X, Cloud, FileType, Sparkles } from 'lucide-react';
import { message, Progress, Button, Tooltip } from 'antd';
import { useDropzone } from 'react-dropzone';

import { validateFile, validateFiles } from '@/utils/validation';
import { formatFileSize, isPdfFile } from '@/utils/helpers';
import { MESSAGES, APP_CONFIG } from '@/utils/constants';
import { usePdfPerformance } from '@/utils/performance';
import { logUserAction } from '@/utils/logger';


const FileUploadZone = ({
  onFilesSelected,
  onFileRemove,
  multiple = false,
  maxFiles = 10,
  maxSize = APP_CONFIG.MAX_FILE_SIZE,
  acceptedTypes = APP_CONFIG.SUPPORTED_FORMATS,
  disabled = false,
  loading = false,
  className = '',
  style = {},
}) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { measureUpload } = usePdfPerformance();

  /**
   * Handle file validation
   * @param {File[]} selectedFiles - Files to validate
   * @returns {Object} Validation result
   */
  const validateSelectedFiles = useCallback((selectedFiles) => {
    if (multiple) {
      return validateFiles(selectedFiles, {
        minCount: 1,
        maxCount: maxFiles,
        maxSize,
        allowedTypes: acceptedTypes,
      });
    } else {
      const file = selectedFiles[0];
      return validateFile(file, {
        maxSize,
        allowedTypes: acceptedTypes,
      });
    }
  }, [multiple, maxFiles, maxSize, acceptedTypes]);

  /**
   * Process selected files
   * @param {File[]} selectedFiles - Files to process
   */
  const processFiles = useCallback((selectedFiles) => {
    const validation = validateSelectedFiles(selectedFiles);
    
    if (!validation.isValid) {
      message.error(validation.message);
      return;
    }

    const processedFiles = selectedFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      error: null,
    }));

    const newFiles = multiple ? [...files, ...processedFiles] : processedFiles;
    setFiles(newFiles);

    // Call parent callback
    if (onFilesSelected) {
      onFilesSelected(processedFiles.map(f => f.file));
    }

    // Log user action
    logUserAction('files_selected', {
      count: processedFiles.length,
      totalSize: processedFiles.reduce((sum, f) => sum + f.size, 0),
      types: processedFiles.map(f => f.type),
    });
  }, [files, multiple, validateSelectedFiles, onFilesSelected]);

  /**
   * Handle file removal
   * @param {string} fileId - File ID to remove
   */
  const handleFileRemove = useCallback((fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    
    if (onFileRemove) {
      const removedFile = files.find(f => f.id === fileId);
      onFileRemove(removedFile?.file);
    }
  }, [files, onFileRemove]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  }, [processFiles]);

  /**
   * Handle browse button click
   */
  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    disabled: disabled || loading,
    multiple,
    maxFiles,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
  });

  return (
    <div className={`w-full ${className}`} style={style}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          upload-zone relative overflow-hidden
          ${isDragActive || dragActive ? 'upload-zone-active' : ''}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${files.length > 0 ? 'border-primary-400 bg-primary-50' : ''}
        `}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-30" />
        
        <div className="relative z-10">
          {/* Upload Icon */}
          <div className="flex justify-center mb-6">
            <div className={`
              p-4 rounded-full transition-all duration-300
              ${isDragActive || dragActive 
                ? 'bg-primary-100 scale-110' 
                : 'bg-white shadow-medium'
              }
            `}>
              {isDragActive || dragActive ? (
                <Cloud className="w-12 h-12 text-primary-600 animate-bounce-soft" />
              ) : (
                <Upload className="w-12 h-12 text-primary-500" />
              )}
            </div>
          </div>

          {/* Upload Text */}
          <div className="text-center mb-6">
            <h3 className={`
              text-2xl font-bold mb-2 transition-colors duration-200
              ${isDragActive || dragActive ? 'text-primary-700' : 'text-gray-800'}
            `}>
              {isDragActive || dragActive ? 'Drop files here' : 'Upload your PDF files'}
            </h3>
            <p className="text-gray-600 text-lg mb-4">
              {isDragActive || dragActive 
                ? 'Release to upload your files' 
                : 'Drag and drop files here, or click to browse'
              }
            </p>
            
            {/* File type info */}
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FileType className="w-4 h-4" />
                <span>PDF files only</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>Up to {formatFileSize(maxSize)}</span>
              </div>
            </div>
          </div>

          {/* Browse Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleBrowseClick}
              disabled={disabled || loading}
              className={`
                btn-primary bg-gradient-to-r from-primary-600 to-primary-700
                text-white font-semibold py-3 px-8 rounded-lg
                flex items-center space-x-2 transition-all duration-300
                hover:shadow-glow hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <File className="w-5 h-5" />
              <span>Browse Files</span>
            </button>
          </div>

          {/* Security notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Your files are secure and will be deleted after processing</span>
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Selected Files ({files.length})
          </h4>
          
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-soft hover:shadow-medium transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <FileType className="w-5 h-5 text-primary-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Progress */}
                  {file.status === 'uploading' && (
                    <div className="w-24">
                      <Progress 
                        percent={file.progress} 
                        size="small" 
                        showInfo={false}
                        strokeColor="#3b82f6"
                      />
                    </div>
                  )}

                  {/* Status Icon */}
                  {file.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleFileRemove(file.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {file.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600">{file.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
