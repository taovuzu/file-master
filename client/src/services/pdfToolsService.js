import { request } from '@/request';
import { API_BASE_URL, DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';

const POLLING_INTERVAL = 2000;
const MAX_POLLING_ATTEMPTS = 5;
const POLLING_TIMEOUT = 300000;

export const JOB_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

const pollJobStatus = async (statusUrl, onProgress, maxAttempts = MAX_POLLING_ATTEMPTS, abortSignal = null) => {
  let attempts = 0;
  const startTime = Date.now();

  const poll = async () => {

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

      const jobId = statusUrl.split('/').pop();
      const response = await request.get({ entity: `download/status/${jobId}` });


      if (!response.success || response.statusCode >= 400 || response.success == "false") {
        throw new Error(response.message || 'Failed to check job status');
      }

      const { status, progress, message, outputFilePath, error: jobError } = response.data;


      if (jobError) {
        throw new Error(jobError);
      }


      if (onProgress) {
        const progressMessage = message || 'Processing...';
        onProgress(progress || 0, progressMessage);
      }


      if (status === JOB_STATUS.COMPLETED) {
        return {
          success: true,
          status: JOB_STATUS.COMPLETED,
          outputFilePath,
          message: 'Job completed successfully'
        };
      }


      if (status === JOB_STATUS.FAILED || status === 'failed' || status === 'error' || status === 'error_processing') {
        throw new Error(message || 'Job processing failed');
      }


      if (status === JOB_STATUS.CANCELLED || status === 'cancelled') {
        throw new Error('Job was cancelled');
      }


      if (abortSignal && abortSignal.aborted) {
        throw new Error('Operation was cancelled');
      }

      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
      return poll();
    } catch (error) {
      attempts++;


      if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        throw new Error(`Connection failed while checking job status`);
      }


      if (error.message.includes('Job processing failed') ||
      error.message.includes('Job was cancelled') ||
      error.message.includes('ApiError')) {
        throw error;
      }

      if (attempts >= maxAttempts) {
        throw error;
      }


      if (abortSignal && abortSignal.aborted) {
        throw new Error('Operation was cancelled');
      }


      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
      return poll();
    }
  };

  return poll();
};


const toClientResult = (resp) => {
  if (!resp || !resp.success) {
    return {
      success: false,
      error: resp?.message || 'Processing failed'
    };
  }


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


  const file = resp?.data?.file || resp?.message?.file || resp?.file;
  return file ?
  {
    success: true,
    file,
    fileUrl: `${DOWNLOAD_BASE_URL}${file}`,
    isJobBased: false
  } :
  {
    success: false,
    error: resp?.message || 'Processing failed'
  };
};


const processPdfToolDirectUpload = async (endpoint, files, options, onProgress, onPollingStart, fieldName = 'PDFFILE', abortSignal = null) => {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  
  fileArray.forEach((file, index) => { 
    formData.append(fieldName, file); 
  });
  
  Object.entries(options).forEach(([key, value]) => { 
    if (value !== undefined && value !== null) { 
      if (typeof value === 'object') { 
        formData.append(key, JSON.stringify(value)); 
      } else { 
        formData.append(key, value); 
      } 
    } 
  });
  
  if (onProgress) { onProgress(10, 'Preparing files...'); }
  const resp = await request.post({ entity: `pdf-tools/${endpoint}`, jsonData: formData });

  const result = toClientResult(resp);
  if (!result.success) {
    throw new Error(result.error);
  }
  if (onProgress) onProgress(45, 'Job submitted, starting processing...');

  if (onPollingStart) onPollingStart();
  const jobResult = await pollJobStatus(result.statusUrl, onProgress, undefined, abortSignal);
  const downloadUrl = `${DOWNLOAD_BASE_URL}${result.jobId}`;
  return { success: true, file: result.jobId, fileUrl: downloadUrl, originalFileName: result.originalFileName, operation: result.operation };
};

const processPdfToolWithPolling = async (endpoint, files, options, onProgress, onPollingStart, fieldName = 'PDFFILE', abortSignal = null) => {
  const s3SupportedTools = ['compress', 'rotate', 'protect', 'unlock', 'watermark/text', 'page-numbers', 'convert/doc-to-pdf', 'convert/pdf-to-ppt', 'convert/pdf-to-doc'];
  
  if (s3SupportedTools.includes(endpoint)) {
    const fileArray = Array.isArray(files) ? files : [files];
    const file = fileArray[0];
    if (!file) throw new Error('No file provided');

    if (onProgress) onProgress(5, 'Requesting secure upload link...');
    const presign = await request.post({ entity: 'upload/presign', jsonData: { fileName: file.name, contentType: file.type || 'application/pdf' } });
    if (!presign?.success) throw new Error(presign?.message || 'Failed to get upload URL');
    const { url, key } = presign;

    if (onProgress) onProgress(15, 'Uploading to secure storage...');
    const putResp = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/pdf' }, body: file });
    if (!putResp.ok) throw new Error('Failed to upload file');
    if (onProgress) onProgress(35, 'Upload complete. Enqueuing job...');

    let requestData = { s3Key: key, originalFileName: file.name };
    
    switch (endpoint) {
      case 'compress':
        requestData.compressionLevel = options?.compressionLevel || options?.level;
        break;
      case 'rotate':
        requestData.angle = options?.angle;
        break;
      case 'protect':
        requestData.password = options?.password;
        break;
      case 'unlock':
        requestData.password = options?.password;
        break;
      case 'watermark/text':
        requestData.text = options?.text;
        requestData.position = options?.position;
        requestData.transparency = options?.transparency;
        requestData.rotation = options?.rotation;
        requestData.layer = options?.layer;
        requestData.fromPage = options?.fromPage;
        requestData.toPage = options?.toPage;
        requestData.fontFamily = options?.fontFamily;
        requestData.fontSize = options?.fontSize;
        requestData.textColor = options?.textColor;
        break;
      case 'page-numbers':
        requestData.pageMode = options?.pageMode;
        requestData.firstPageCover = options?.firstPageCover;
        requestData.position = options?.position;
        requestData.margin = options?.margin;
        requestData.firstNumber = options?.firstNumber;
        requestData.fromPage = options?.fromPage;
        requestData.toPage = options?.toPage;
        requestData.textStyle = options?.textStyle;
        requestData.fontFamily = options?.fontFamily;
        requestData.fontSize = options?.fontSize;
        requestData.textColor = options?.textColor;
        break;
      case 'convert/doc-to-pdf':
      case 'convert/images-to-pdf':
      case 'convert/pdf-to-ppt':
      case 'convert/pdf-to-doc':
        requestData = { ...requestData, ...options };
        break;
    }

    const resp = await request.post({ entity: `pdf-tools/${endpoint}`, jsonData: requestData });
    const result = toClientResult(resp);
    if (!result.success) throw new Error(result.error);
    if (onProgress) onProgress(45, 'Job submitted, starting processing...');

    if (onPollingStart) onPollingStart();
    const jobResult = await pollJobStatus(result.statusUrl, onProgress, undefined, abortSignal);
    const downloadUrl = `${DOWNLOAD_BASE_URL}${result.jobId}`;
    return { success: true, file: result.jobId, fileUrl: downloadUrl, originalFileName: result.originalFileName, operation: result.operation };
  }

  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => { formData.append(fieldName, file); });
  Object.entries(options).forEach(([key, value]) => { if (value !== undefined && value !== null) { if (typeof value === 'object') { formData.append(key, JSON.stringify(value)); } else { formData.append(key, value); } } });
  if (onProgress) { onProgress(10, 'Preparing files...'); }
  const resp = await request.post({ entity: `pdf-tools/${endpoint}`, jsonData: formData });

  const result = toClientResult(resp);
  if (!result.success) {
    throw new Error(result.error);
  }


  if (result.isJobBased) {
    if (onProgress) {
      onProgress(40, 'Job submitted, starting processing...');
    }


    if (onPollingStart) {
      onPollingStart();
    }

    try {

      const jobResult = await pollJobStatus(result.statusUrl, onProgress, undefined, abortSignal);


      const downloadUrl = `${DOWNLOAD_BASE_URL}${result.jobId}`;
      return {
        success: true,
        file: result.jobId,
        fileUrl: downloadUrl,
        originalFileName: result.originalFileName,
        operation: result.operation
      };
    } catch (error) {

      if (error.message.includes('Connection failed') || error.message.includes('Failed to fetch')) {
        throw new Error('Unable to check job status. Please try again later or contact support if the issue persists.');
      }
      throw error;
    }
  }


  return result;
};


export const mergePdfs = async (files, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  const fileArray = Array.isArray(files) ? files : [files];
  if (fileArray.length === 0) throw new Error('No files provided');

  if (onProgress) onProgress(5, 'Requesting secure upload links...');
  
  const uploadPromises = fileArray.map(async (file) => {
    const presign = await request.post({ 
      entity: 'upload/presign', 
      jsonData: { fileName: file.name, contentType: file.type || 'application/pdf' } 
    });
    if (!presign?.success) throw new Error(presign?.message || 'Failed to get upload URL');
    return { file, presign };
  });
  
  const uploadData = await Promise.all(uploadPromises);
  
  if (onProgress) onProgress(15, 'Uploading files to secure storage...');
  
  const uploadPromises2 = uploadData.map(async ({ file, presign }) => {
    const putResp = await fetch(presign.url, { 
      method: 'PUT', 
      headers: { 'Content-Type': file.type || 'application/pdf' }, 
      body: file 
    });
    if (!putResp.ok) throw new Error('Failed to upload file');
    return presign.key;
  });
  
  const s3Keys = await Promise.all(uploadPromises2);
  
  if (onProgress) onProgress(35, 'Upload complete. Enqueuing job...');
  
  const resp = await request.post({ 
    entity: 'pdf-tools/merge', 
    jsonData: { 
      s3Keys, 
      originalFileNames: fileArray.map(f => f.name) 
    } 
  });
  
  const result = toClientResult(resp);
  if (!result.success) throw new Error(result.error);
  
  if (onProgress) onProgress(45, 'Job submitted, starting processing...');
  
  if (onPollingStart) onPollingStart();
  const jobResult = await pollJobStatus(result.statusUrl, onProgress, undefined, abortSignal);
  const downloadUrl = `${DOWNLOAD_BASE_URL}${result.jobId}`;
  return { success: true, file: result.jobId, fileUrl: downloadUrl, originalFileName: result.originalFileName, operation: result.operation };
};


export const splitPdf = async (file, ranges = [], options = {}, onProgress, onPollingStart, abortSignal = null) => {
  if (!file) throw new Error('No file provided');

  if (onProgress) onProgress(5, 'Requesting secure upload link...');
  const presign = await request.post({ 
    entity: 'upload/presign', 
    jsonData: { fileName: file.name, contentType: file.type || 'application/pdf' } 
  });
  if (!presign?.success) throw new Error(presign?.message || 'Failed to get upload URL');
  const { url, key } = presign;

  if (onProgress) onProgress(15, 'Uploading to secure storage...');
  const putResp = await fetch(url, { 
    method: 'PUT', 
    headers: { 'Content-Type': file.type || 'application/pdf' }, 
    body: file 
  });
  if (!putResp.ok) throw new Error('Failed to upload file');
  if (onProgress) onProgress(35, 'Upload complete. Enqueuing job...');

  const resp = await request.post({ 
    entity: 'pdf-tools/split', 
    jsonData: { 
      s3Key: key, 
      ranges, 
      originalFileName: file.name 
    } 
  });
  
  const result = toClientResult(resp);
  if (!result.success) throw new Error(result.error);
  
  if (onProgress) onProgress(45, 'Job submitted, starting processing...');
  
  if (onPollingStart) onPollingStart();
  const jobResult = await pollJobStatus(result.statusUrl, onProgress, undefined, abortSignal);
  const downloadUrl = `${DOWNLOAD_BASE_URL}${result.jobId}`;
  return { success: true, file: result.jobId, fileUrl: downloadUrl, originalFileName: result.originalFileName, operation: result.operation };
};


export const compressPdf = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('compress', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};


export const convertPdf = async (input, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  const { conversionType } = options || {};

  if (conversionType === 'doc-to-pdf' || conversionType === 'ppt-to-pdf' || conversionType === 'excel-to-pdf') {
    return processPdfToolWithPolling('convert/doc-to-pdf', [input], options, onProgress, onPollingStart, 'DOCFILE', abortSignal);
  }

  if (conversionType === 'image-to-pdf') {
    return processPdfToolDirectUpload('convert/images-to-pdf', input, options, onProgress, onPollingStart, 'IMAGEFILE', abortSignal);
  }

  if (conversionType === 'pdf-to-pptx') {
    return processPdfToolWithPolling('convert/pdf-to-ppt', [input], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
  }

  if (conversionType === 'pdf-to-docx') {
    return processPdfToolWithPolling('convert/pdf-to-doc', [input], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
  }

  return { success: false, error: 'Unknown conversion type' };
};


export const protectPdf = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('protect', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};


export const unlockPdf = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('unlock', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};


export const rotatePdf = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('rotate', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};


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
    textColor
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
      textColor: Array.isArray(textColor) ? textColor : undefined
    };

    return processPdfToolWithPolling('watermark/text', [file], watermarkOptions, onProgress, onPollingStart, 'PDFFILE', abortSignal);
  }

  return { success: false, error: 'Unsupported watermark type' };
};


export const addPageNumbers = async (file, options = {}, onProgress, onPollingStart, abortSignal = null) => {
  return processPdfToolWithPolling('page-numbers', [file], options, onProgress, onPollingStart, 'PDFFILE', abortSignal);
};


export const downloadFile = async (fileOrUrl, fileName) => {
  const url = fileOrUrl?.startsWith('http') ? fileOrUrl : `${DOWNLOAD_BASE_URL}${fileOrUrl}`;
  
  if (!fileOrUrl?.startsWith('http')) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.downloadUrl) {
          const downloadResponse = await fetch(data.downloadUrl);
          const blob = await downloadResponse.blob();
          
          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
          
          const downloadFileName = data.fileName || fileName || 'processed-document.pdf';
          link.setAttribute('download', downloadFileName);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(objectUrl);
          
          return { success: true, fileName: downloadFileName, contentType: data.contentType };
        } else {
          throw new Error('Invalid response from download endpoint');
        }
      } else {
        throw new Error(`Download failed: ${response.status}`);
      }
    } catch (error) {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'processed-document.pdf');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    }
  } else {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'processed-document.pdf');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  }
};


export const checkJobStatus = async (jobId) => {
  try {
    const response = await request.get({ entity: `download/status/${jobId}` });
    return response;
  } catch (error) {
    return { success: false, error: error.message };
  }
};