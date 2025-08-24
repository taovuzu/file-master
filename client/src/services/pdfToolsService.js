import { request } from '@/request';
import { API_BASE_URL, DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';

// Job status polling configuration
const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_ATTEMPTS = 5; // 5 minutes max
const POLLING_TIMEOUT = 300000; // 5 minutes

// Job status enum
export const JOB_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Poll job status until completion
const pollJobStatus = async (statusUrl, onProgress, maxAttempts = MAX_POLLING_ATTEMPTS, abortSignal = null) => {
  let attempts = 0;
  const startTime = Date.now();

  const poll = async () => {
    // Check if operation was aborted
    if (abortSignal && abortSignal.aborted) {
      throw new Error('Operation was cancelled');
    }
    
    if (attempts >= maxAttempts) {
      throw new Error(`Job polling timeout exceeded after ${Math.round((Date.now() - startTime) / 1000)}s`);
    }

    if (Date.now() - startTime > POLLING_TIMEOUT) {
      throw new Error(`Job polling timeout exceeded after ${Math.round((Date.now() - startTime) / 1000)}s`);
    }

    try {
      // Extract the job ID from the status URL
      const jobId = statusUrl.split('/').pop();
      const response = await request.get({ entity: `download/status/${jobId}` });
      
      // Check for API-level errors first
      if (!response.success || response.statusCode >= 400 || response.success == "false") {
        throw new Error(response.message || 'Failed to check job status');
      }

      const { status, progress, message, outputFilePath, error: jobError } = response.data;
      
      // Check for job-level errors
      if (jobError) {
        throw new Error(jobError);
      }
      
      // Update progress
      if (onProgress) {
        const progressMessage = message || 'Processing...';
        onProgress(progress || 0, progressMessage);
      }

      // Check if job is complete
      if (status === JOB_STATUS.COMPLETED) {
        return {
          success: true,
          status: JOB_STATUS.COMPLETED,
          outputFilePath,
          message: 'Job completed successfully'
        };
      }

      // Check for job failure states
      if (status === JOB_STATUS.FAILED || status === 'failed' || status === 'error' || status === 'error_processing') {
        throw new Error(message || 'Job processing failed');
      }

      // Check if job was cancelled
      if (status === JOB_STATUS.CANCELLED || status === 'cancelled') {
        throw new Error('Job was cancelled');
      }
      
      // Check if operation was aborted before waiting
      if (abortSignal && abortSignal.aborted) {
        throw new Error('Operation was cancelled');
      }
      
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
      return poll();
    } catch (error) {
      attempts++;
      
      // If this is a network/connection error, provide better error message
      if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        throw new Error(`Connection failed while checking job status`);
      }
      
      // If the error indicates the job has failed or was cancelled, don't retry
      if (error.message.includes('Job processing failed') || 
          error.message.includes('Job was cancelled') ||
          error.message.includes('ApiError')) {
        throw error; // Re-throw immediately without retrying
      }
      
      if (attempts >= maxAttempts) {
        throw error;
      }
      
      // Check if operation was aborted before retrying
      if (abortSignal && abortSignal.aborted) {
        throw new Error('Operation was cancelled');
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
      return poll();
    }
  };

  return poll();
};

// Normalize API response from server to a common shape
const toClientResult = (resp) => {
  if (!resp || !resp.success) {
    return { 
      success: false, 
      error: resp?.message || 'Processing failed' 
    };
  }

  // Check if this is a job-based response
  if (resp.data?.jobId && resp.data?.statusUrl) {
    return {
      success: true,
      jobId: resp.data.jobId,
      statusUrl: resp.data.statusUrl,
      downloadUrl: resp.data.downloadUrl,
      operation: resp.data.operation,
      originalFileName: resp.data.originalFileName,
      message: resp.data.message,
      isJobBased: true
    };
  }

  // Legacy file-based response (fallback)
  const file = resp?.data?.file || resp?.message?.file || resp?.file;
  return file
    ? { 
        success: true, 
        file, 
        fileUrl: `${DOWNLOAD_BASE_URL}${file}`,
        isJobBased: false
      }
    : { 
        success: false, 
        error: resp?.message || 'Processing failed' 
      };
};

// Generic function to process PDF tools with job polling
const processPdfToolWithPolling = async (endpoint, files, options, onProgress, onPollingStart, fieldName = 'PDFFILE', abortSignal = null) => {
  const formData = new FormData();
  
  // Add files
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => {
    formData.append(fieldName, file);
    console.log(`Added file to FormData:`, { fieldName, fileName: file.name, fileSize: file.size, fileType: file.type });
  });

  // Add other options
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
        console.log(`Added option to FormData:`, { key, value: JSON.stringify(value) });
      } else {
        formData.append(key, value);
        console.log(`Added option to FormData:`, { key, value });
      }
    }
  });

  // Debug: Log FormData contents
  console.log(`FormData created for ${endpoint}:`, {
    fieldName,
    fileCount: fileArray.length,
    optionsCount: Object.keys(options).length,
    formDataEntries: Array.from(formData.entries())
  });

  if (onProgress) {
    onProgress(10, 'Preparing files...');
  }

  // Submit job - use the correct endpoint path
  const resp = await request.post({
    entity: `pdf-tools/${endpoint}`,
    jsonData: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 30); // 30% for upload
        onProgress(10 + uploadProgress, `Uploading files... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
      }
    }
  });

  const result = toClientResult(resp);
  console.log(result);
  if (!result.success) {
    throw new Error(result.error);
  }

      // If job-based, start polling
    if (result.isJobBased) {
      if (onProgress) {
        onProgress(40, 'Job submitted, starting processing...');
      }

      // Signal that polling is starting
      if (onPollingStart) {
        onPollingStart();
      }

      try {
        // Poll for job completion
        const jobResult = await pollJobStatus(result.statusUrl, onProgress, undefined, abortSignal);
        
        // pollJobStatus already handles error cases, so if we get here, the job completed successfully
        const downloadUrl = `${DOWNLOAD_BASE_URL}${result.jobId}`;
        return {
          success: true,
          file: result.jobId,
          fileUrl: downloadUrl,
          originalFileName: result.originalFileName,
          operation: result.operation
        };
      } catch (error) {
        // Handle specific polling errors
        if (error.message.includes('Connection failed') || error.message.includes('Failed to fetch')) {
          throw new Error('Unable to check job status. Please try again later or contact support if the issue persists.');
        }
        throw error;
      }
    }

  // Legacy file-based response
  return result;
};

// Merge PDFs (field: PDFFILE)
export const mergePdfs = async (files, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('merge', files, options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};

// Split PDF (field: PDFFILE)
export const splitPdf = async (file, ranges = [], options = {}, onProgress, onPollingStart) => {
  const formData = new FormData();
  formData.append('PDFFILE', file);
  formData.append('ranges', JSON.stringify(ranges));

  if (onProgress) {
    onProgress(10, 'Preparing file for split...');
  }

  const resp = await request.post({
    entity: 'pdf-tools/split',
    jsonData: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 30);
        onProgress(10 + uploadProgress, `Uploading file... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
      }
    }
  });

  const result = toClientResult(resp);
  
  if (!result.success) {
    throw new Error(result.error);
  }

  // If job-based, start polling
  if (result.isJobBased) {
    if (onProgress) {
      onProgress(40, 'Job submitted, starting processing...');
    }

    // Signal that polling is starting
    if (onPollingStart) {
      onPollingStart();
    }

    try {
      const jobResult = await pollJobStatus(result.statusUrl, onProgress, undefined, abortSignal);
      console.log("jobResult * ", jobResult);
      // pollJobStatus already handles error cases, so if we get here, the job completed successfully
      const downloadUrl = `${DOWNLOAD_BASE_URL}${result.jobId}`;
      return {
        success: true,
        file: result.jobId,
        fileUrl: downloadUrl,
        originalFileName: result.originalFileName,
        operation: result.operation
      };
    } catch (error) {
      // Handle specific polling errors
      if (error.message.includes('Connection failed') || error.message.includes('Failed to fetch')) {
        throw new Error('Unable to check job status. Please try again later or contact support if the issue persists.');
      }
      throw error;
    }
  }

  return result;
};

// Compress PDF (field: PDFFILE, body: compressionLevel)
export const compressPdf = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('compress', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};

// Convert PDF
export const convertPdf = async (input, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  const { conversionType } = options || {};

  if (conversionType === 'doc-to-pdf' || conversionType === 'ppt-to-pdf' || conversionType === 'excel-to-pdf') {
    return processPdfToolWithPolling('convert/doc-to-pdf', [input], options, onProgress, onPollingStart, 'DOCFILE', abortSignal);
  }

  if (conversionType === 'image-to-pdf') {
    return processPdfToolWithPolling('convert/images-to-pdf', input, options, onProgress, onPollingStart, 'IMAGEFILE', abortSignal);
  }

  if (conversionType === 'pdf-to-pptx') {
    return processPdfToolWithPolling('convert/pdf-to-ppt', [input], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
  }

  return { success: false, error: 'Unknown conversion type' };
};

// Protect PDF
export const protectPdf = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('protect', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};

// Unlock PDF
export const unlockPdf = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('unlock', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};

// Rotate PDF
export const rotatePdf = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('rotate', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};

// Add watermark to PDF
export const addWatermark = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  const {
    watermarkType = 'text',
    text,
    position,
    transparency,
    rotation,
    layer,
    fromPage,
    toPage,
    fontFamily,
    fontSize,
    textColor,
  } = options;

  if (watermarkType === 'text') {
    const watermarkOptions = {
      text,
      position,
      transparency,
      rotation,
      layer,
      fromPage,
      toPage,
      fontFamily,
      fontSize,
      textColor: Array.isArray(textColor) ? textColor : undefined,
    };

    return processPdfToolWithPolling('watermark/text', [file], watermarkOptions, onProgress, onPollingStart, 'PDFFILE', abortSignal);
  }
  
  return { success: false, error: 'Unsupported watermark type' };
};

// Add page numbers to PDF
export const addPageNumbers = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('page-numbers', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};

// Download processed file by filename or full URL
export const downloadFile = async (fileOrUrl, fileName) => {
  const url = fileOrUrl?.startsWith('http') ? fileOrUrl : `${DOWNLOAD_BASE_URL}${fileOrUrl}`;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName || 'processed-document.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  return { success: true };
};

// Check job status manually (for external use)
export const checkJobStatus = async (jobId) => {
  try {
    const response = await request.get({ entity: `download/status/${jobId}` });
    return response;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
