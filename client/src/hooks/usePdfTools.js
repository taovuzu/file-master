import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProcessedFile as setProcessedFileAction } from '@/redux/pdfTools';
import * as pdfToolsService from '@/services/pdfToolsService';
import notify from '@/utils/notify';

export const usePdfTools = (toolType) => {
  const [loading, setLoading] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);

  const dispatch = useDispatch();
  const processedFileFromStore = useSelector((state) => state.pdfTools.processedFile);

  const { isLoggedIn, current: user } = useSelector((state) => state.auth);

  const processPdfTool = useCallback(async (files, formValues = {}, onProgress, abortSignal = null) => {

    if (!files || Array.isArray(files) && files.length === 0) {
      notify.error('Please select files to process', 'select-files');
      return { success: false, error: 'No files selected' };
    }

    setLoading(true);
    setError(null);
    setJobId(null);

    try {
      let result;
      const fileArray = Array.isArray(files) ? files : [files];
      const primaryFile = fileArray[0];


      switch (toolType) {
        case 'merge':
          result = await pdfToolsService.mergePdfs(fileArray, formValues, onProgress, undefined, abortSignal);
          break;
        case 'split':
          result = await pdfToolsService.splitPdf(primaryFile, formValues, onProgress, undefined, abortSignal);
          break;
        case 'compress':
          result = await pdfToolsService.compressPdf(primaryFile, formValues, onProgress, undefined, abortSignal);
          break;
        case 'convert':
          result = await pdfToolsService.convertPdf(primaryFile, formValues, onProgress, undefined, abortSignal);
          break;
        case 'image-to-pdf':
          result = await pdfToolsService.convertPdf(fileArray, formValues, onProgress, undefined, abortSignal);
          break;
        case 'protect':
          result = await pdfToolsService.protectPdf(primaryFile, formValues, onProgress, undefined, abortSignal);
          break;
        case 'unlock':
          result = await pdfToolsService.unlockPdf(primaryFile, formValues, onProgress, undefined, abortSignal);
          break;
        case 'rotate':
          result = await pdfToolsService.rotatePdf(primaryFile, formValues, onProgress, undefined, abortSignal);
          break;
        case 'watermark':
          result = await pdfToolsService.addWatermark(primaryFile, formValues, onProgress, undefined, abortSignal);
          break;
        case 'page-numbers':
          result = await pdfToolsService.addPageNumbers(primaryFile, formValues, onProgress, undefined, abortSignal);
          break;
        default:
          throw new Error(`Unknown tool type: ${toolType}`);
      }

      if (result.success && result.fileUrl) {
        setProcessedFile(result.fileUrl);
        setJobId(result.file);
        dispatch(setProcessedFileAction(result.fileUrl));


        const operationName = toolType.charAt(0).toUpperCase() + toolType.slice(1).replace('-', ' ');
        notify.success(`${operationName} completed successfully!`, 'tool-success');

        return {
          success: true,
          data: {
            ...result,
            operation: toolType,
            originalFileName: result.originalFileName || primaryFile.name
          }
        };
      } else {
        throw new Error(result.error || result.message || 'Processing failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during processing';
      setError(errorMessage);
      notify.error(errorMessage, 'tool-error');


      return {
        success: false,
        error: errorMessage,
        data: null
      };
    } finally {
      setLoading(false);
    }
  }, [toolType, isLoggedIn, dispatch]);


  const downloadProcessedFile = useCallback(async (fileName) => {
    if (!processedFile) {
      notify.error('No file to download', 'no-download');
      return;
    }

    try {
      setLoading(true);
      await pdfToolsService.downloadFile(processedFile, fileName);

      notify.success('Download started', 'download-started');
    } catch (err) {
      notify.error('Download failed', 'download-failed');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [processedFile]);


  const checkJobStatus = useCallback(async (jobIdToCheck) => {
    if (!jobIdToCheck) {
      notify.error('No job ID provided', 'no-job-id');
      return null;
    }

    try {
      setLoading(true);
      const status = await pdfToolsService.checkJobStatus(jobIdToCheck);
      return status;
    } catch (err) {
      notify.error('Failed to check job status', 'status-check-failed');
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);


  const reset = useCallback(() => {
    setProcessedFile(null);
    setError(null);
    setLoading(false);
    setJobId(null);
  }, []);


  const validateFiles = useCallback((files, requirements = {}) => {
    const { minFiles = 1, maxFiles = 10, maxSize = 10, allowedTypes = ['application/pdf'] } = requirements;

    if (!files || Array.isArray(files) && files.length === 0) {
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
        const allowedTypesText = allowedTypes.map(type => {
          if (type === 'application/pdf') return 'PDF';
          if (type === 'image/jpeg') return 'JPG';
          if (type === 'image/png') return 'PNG';
          if (type === 'image/jpg') return 'JPG';
          return type;
        }).join(', ');
        return { valid: false, error: `Invalid file type. Only ${allowedTypesText} files are allowed.` };
      }

      if (file.size / 1024 / 1024 > maxSize) {
        return { valid: false, error: `File size must be less than ${maxSize}MB` };
      }
    }

    return { valid: true };
  }, []);

  return {

    loading,
    processedFile,
    error,
    jobId,
    isLoggedIn,
    user,


    processPdfTool,
    downloadProcessedFile,
    checkJobStatus,
    reset,
    validateFiles,
    processedFileFromStore
  };
};