import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  File,
  CheckCircle,
  X,
  Cloud,
  FileType,
  Sparkles,
} from
  "lucide-react";
import { message } from "antd";
import { useDropzone } from "react-dropzone";

import { validateFile, validateFiles } from "@/utils/validation";
import { formatFileSize, isPdfFile } from "@/utils/helpers";
import { MESSAGES, APP_CONFIG } from "@/utils/constants";
import PdfPreview from "@/components/PdfPreview";

const FileUploadZone = ({
  onFilesSelected,
  onFileRemove,
  onRotationMapChange,
  fileList = [],
  multiple = false,
  maxFiles = 10,
  maxSize = APP_CONFIG.MAX_FILE_SIZE,
  acceptedTypes = APP_CONFIG.SUPPORTED_FORMATS,
  disabled = false,
  loading = false,
  className = "",
  style = {}
}) => {
  const [files, setFiles] = useState([]);
  const [rotationMap, setRotationMap] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (fileList && fileList.length > 0) {
      const processedFiles = fileList.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending",
        progress: 0,
        error: null
      }));
      setFiles(processedFiles);
    } else {
      setFiles([]);
    }
  }, [fileList]);

  const validateSelectedFiles = useCallback(
    (selectedFiles) => {
      if (multiple) {
        return validateFiles(selectedFiles, {
          minCount: 1,
          maxCount: maxFiles,
          maxSize,
          allowedTypes: acceptedTypes
        });
      } else {
        const file = selectedFiles[0];
        return validateFile(file, {
          maxSize,
          allowedTypes: acceptedTypes
        });
      }
    },
    [multiple, maxFiles, maxSize, acceptedTypes]
  );

  const processFiles = useCallback(
    (selectedFiles) => {
      const validation = validateSelectedFiles(selectedFiles);

      if (!validation.isValid) {
        message.error(validation.message);
        return;
      }

      const processedFiles = selectedFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending",
        progress: 0,
        error: null
      }));

      const newFiles = multiple ?
        [...files, ...processedFiles] :
        processedFiles;
      setFiles(newFiles);

      if (onFilesSelected) {
        onFilesSelected(newFiles.map((f) => f.file));
      }
    },
    [files, multiple, validateSelectedFiles, onFilesSelected]
  );

  const handleFileRemove = useCallback(
    (fileId) => {
      const updatedFiles = files.filter((f) => f.id !== fileId);
      setFiles(updatedFiles);

      if (onFileRemove) {
        const removedFile = files.find((f) => f.id === fileId);
        onFileRemove(removedFile?.file);
      }

      if (onFilesSelected) {
        onFilesSelected(updatedFiles.map((f) => f.file));
      }
    },
    [files, onFileRemove, onFilesSelected]
  );

  const handleReorder = useCallback((reordered) => {
    setFiles(reordered);

    if (onFilesSelected) {
      onFilesSelected(reordered.map((f) => f.file));
    }
  }, [onFilesSelected]);

  const handleRotateChange = useCallback((fileId, deg) => {
    setRotationMap((prev) => {
      const next = { ...prev, [fileId]: deg };
      if (onRotationMapChange) {

        const nameMap = {};
        files.forEach((f) => {
          const id = f.id;
          const d = next[id] || 0;
          if (f?.file?.name) nameMap[f.file.name] = d;
        });
        onRotationMapChange({ byId: next, byName: nameMap });
      }
      return next;
    });
  }, [files, onRotationMapChange]);

  const handleFileInputChange = useCallback(
    (event) => {
      const selectedFiles = Array.from(event.target.files);
      if (selectedFiles.length > 0) {
        processFiles(selectedFiles);
      }
    },
    [processFiles]
  );

  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

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
    }, {})
  });

  if (files.length > 0) {
    return (
      <div className={`w-full ${className}`} style={style}>
        { }
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
          className="hidden" />
        { }
        <PdfPreview
          files={files}
          onRemove={handleFileRemove}
          onAdd={handleBrowseClick}
          onReorder={handleReorder}
          onRotateChange={handleRotateChange}
          disabled={disabled || loading} />
      </div>);
  }

  const acceptedLabel = () => {
    if (!acceptedTypes || acceptedTypes.length === 0) return 'Any files';
    const map = {
      'application/pdf': 'PDF',
      'image/jpeg': 'JPG/JPEG',
      'image/png': 'PNG',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.ms-powerpoint': 'PPT',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX'
    };
    const labels = acceptedTypes.map((t) => map[t] || t.split('/').pop()?.toUpperCase() || t);
    return Array.from(new Set(labels)).join(', ');
  };

  return (
    <div className={`w-[80%] md:w-[40%] ${className}`} style={style}>
      { }
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden" />
      { }
      <div
        {...getRootProps()}
        className={`
          upload-zone relative overflow-hidden
          ${isDragActive || dragActive ? "upload-zone-active" : ""}
          ${disabled || loading ?
            "opacity-50 cursor-not-allowed" :
            "cursor-pointer"}
        `
        }>
        { }
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-30" />
        <div className="relative z-10">
          { }
          <div className="flex justify-center mb-6">
            <div
              className={`
              p-4 rounded-full transition-all duration-300
              ${isDragActive || dragActive ?
                  "bg-primary-100 scale-110" :
                  "bg-white shadow-medium"}
            `
              }>
              {isDragActive || dragActive ?
                <Cloud className="w-12 h-12 text-primary-600 animate-bounce-soft" /> :

                <Upload className="w-12 h-12 text-primary-500" />
              }
            </div>
          </div>
          { }
          <div className="text-center mb-6">
            <h3
              className={`
              text-2xl font-bold mb-2 transition-colors duration-200
              ${isDragActive || dragActive ?
                  "text-primary-700" :
                  "text-gray-800"}
            `
              }>
              {isDragActive || dragActive ?
                "Drop files here" :
                "Upload your files"}
            </h3>
            <p className="text-gray-600 text-lg mb-4">
              {isDragActive || dragActive ?
                "Release to upload your files" :
                "Drag and drop files here, or click to browse"}
            </p>
            { }
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FileType className="w-4 h-4" />
                <span>Allowed: {acceptedLabel()}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>Up to {formatFileSize(maxSize)} for Free Users</span>
              </div>
            </div>
          </div>
          { }
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
                ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
              `}>
              <File className="w-5 h-5" />
              <span>Browse Files</span>
            </button>
          </div>
          { }
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>
                Your files are secure and will be deleted after 24 hours of processing
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>);

};

export default FileUploadZone;