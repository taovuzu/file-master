import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPdfProcessedFile } from '@/redux/pdf/selectors';
import { setProcessedFile as setProcessedFileAction } from '@/redux/pdf/actions';
import * as pdfToolsService from '@/services/pdfToolsService';
import { message } from 'antd';

export const usePdfTools = (toolType) => {
  const [loading, setLoading] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const processedFileFromStore = useSelector(selectPdfProcessedFile);
  
  // Get auth state from Redux
  const { isLoggedIn, current: user } = useSelector((state) => state.auth);

  // Process PDF based on tool type
  const processPdfTool = useCallback(async (files, formValues = {}, onProgress) => {
    if (!isLoggedIn) {
      message.error('Please login to use PDF tools');
      return { success: false, error: 'Authentication required' };
    }

    if (!files || (Array.isArray(files) && files.length === 0)) {
      message.error('Please select files to process');
      return { success: false, error: 'No files selected' };
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      const fileArray = Array.isArray(files) ? files : [files];
      const primaryFile = fileArray[0];

      // Use the appropriate service based on tool type
      switch (toolType) {
        case 'merge':
          result = await pdfToolsService.mergePdfs(fileArray, formValues, onProgress);
          break;
        case 'split':
          result = await pdfToolsService.splitPdf(primaryFile, formValues, onProgress);
          break;
        case 'compress':
          result = await pdfToolsService.compressPdf(primaryFile, formValues, onProgress);
          break;
        case 'convert':
          result = await pdfToolsService.convertPdf(primaryFile, formValues, onProgress);
          break;
        case 'protect':
          result = await pdfToolsService.protectPdf(primaryFile, formValues, onProgress);
          break;
        case 'unlock':
          result = await pdfToolsService.unlockPdf(primaryFile, formValues, onProgress);
          break;
        case 'rotate':
          result = await pdfToolsService.rotatePdf(primaryFile, formValues, onProgress);
          break;
        case 'watermark':
          result = await pdfToolsService.addWatermark(primaryFile, formValues, onProgress);
          break;
        case 'page-numbers':
          result = await pdfToolsService.addPageNumbers(primaryFile, formValues, onProgress);
          break;
        default:
          throw new Error(`Unknown tool type: ${toolType}`);
      }

      if (result.success && result.fileUrl) {
        setProcessedFile(result.fileUrl);
        dispatch(setProcessedFileAction(result.fileUrl));
        message.success(`${toolType} completed successfully!`);

        return { success: true, data: result };
      } else {
        throw new Error(result.error || result.message || 'Processing failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during processing';
      setError(errorMessage);
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [toolType, isLoggedIn, dispatch]);

  // Download processed file
  const downloadProcessedFile = useCallback(async (fileName) => {
    if (!processedFile) {
      message.error('No file to download');
      return;
    }

    try {
      setLoading(true);
      await pdfToolsService.downloadFile(processedFile, fileName);

      message.success('Download started');
    } catch (err) {
      message.error('Download failed');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [processedFile]);

  // Reset state
  const reset = useCallback(() => {
    setProcessedFile(null);
    setError(null);
    setLoading(false);
  }, []);

  // Validate files
  const validateFiles = useCallback((files, requirements = {}) => {
    const { minFiles = 1, maxFiles = 10, maxSize = 10, allowedTypes = ['application/pdf'] } = requirements;
    
    if (!files || (Array.isArray(files) && files.length === 0)) {
      return { valid: false, error: 'No files selected' };
    }

    const fileArray = Array.isArray(files) ? files : [files];
    
    if (fileArray.length < minFiles) {
      return { valid: false, error: `Please select at least ${minFiles} file(s)` };
    }
    
    if (fileArray.length > maxFiles) {
      return { valid: false, error: `Maximum ${maxFiles} files allowed` };
    }

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Only PDF files are allowed.' };
      }
      
      if (file.size / 1024 / 1024 > maxSize) {
        return { valid: false, error: `File size must be less than ${maxSize}MB` };
      }
    }

    return { valid: true };
  }, []);

  return {
    // State
    loading,
    processedFile,
    error,
    isLoggedIn,
    user,
    
    // Actions
    processPdfTool,
    downloadProcessedFile,
    reset,
    validateFiles,
    processedFileFromStore,
  };
};
