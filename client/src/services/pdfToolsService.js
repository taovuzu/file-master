import { request } from '@/request';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';

// Normalize API response from server to a common shape
const toClientResult = (resp) => {
  // Server returns: { statusCode, data: <message string>, message: { file: <filename> }, success }
  const file = resp?.data?.file || resp?.message?.file || resp?.file;
  console.log("pdfToolService data -> " , file);
  return file
    ? { success: true, file, fileUrl: `${DOWNLOAD_BASE_URL}${file}` }
    : { success: false, error: resp?.message || 'Processing failed' };
};

// Helper function to create FormData with progress tracking
const createFormDataWithProgress = (files, options = {}, onProgress) => {
  const formData = new FormData();
  
  // Add files
  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => {
    // Determine the field name based on file type
    if (file.type === 'application/pdf') {
      formData.append('PDFFILE', file);
    } else if (file.type.includes('image/')) {
      formData.append('IMAGEFILE', file);
    } else if (file.type.includes('document/') || file.type.includes('word')) {
      formData.append('DOCFILE', file);
    } else {
      formData.append('PDFFILES', file); // fallback
    }
  });
  
  // Add options
  Object.entries(options).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      formData.append(k, v);
    }
  });
  
  return formData;
};

// Helper function to calculate total file size for progress tracking
const calculateTotalFileSize = (files) => {
  const fileArray = Array.isArray(files) ? files : [files];
  return fileArray.reduce((total, file) => total + file.size, 0);
};

// Merge PDFs (field: PDFFILES)
export const mergePdfs = async (files, options = {}, onProgress) => {
  const formData = createFormDataWithProgress(files, options, onProgress);
  const totalFileSize = calculateTotalFileSize(files);
  
  if (onProgress) {
    onProgress(5, 'Preparing files for merge...');
  }
  
  const resp = await request.post({ 
    entity: 'merge/pdf', 
    jsonData: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        // Calculate upload progress based on actual bytes uploaded
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85); // 85% for upload
        onProgress(5 + uploadProgress, `Uploading files... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
      }
    }
  });
  
  if (onProgress) {
    onProgress(95, 'Processing files on server...');
  }
  
  // Simulate a small delay for server processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (onProgress) {
    onProgress(100, 'Merge completed');
  }
  
  return toClientResult(resp);
};

// Split PDF (field: PDFFILE)
export const splitPdf = async (file, ranges = [], options = {}, onProgress) => {
  const formData = createFormDataWithProgress(file, options, onProgress);
  formData.append('ranges', JSON.stringify(ranges));
  console.log(ranges);
  
  if (onProgress) {
    onProgress(5, 'Preparing file for split...');
  }
  
  const resp = await request.post({ 
    entity: 'split/pdf', 
    jsonData: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        // Calculate upload progress based on actual bytes uploaded
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85); // 85% for upload
        onProgress(5 + uploadProgress, `Uploading file... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
      }
    }
  });
  
  if (onProgress) {
    onProgress(95, 'Processing file on server...');
  }
  
  // Simulate a small delay for server processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (onProgress) {
    onProgress(100, 'Split completed');
  }
  
  return toClientResult(resp);
};


// Compress PDF (field: PDFFILE, body: compressionLevel)
export const compressPdf = async (file, options = {}, onProgress) => {
  const formData = createFormDataWithProgress(file, options, onProgress);
  const level = options.level ?? options.compressionLevel;
  if (level != null) formData.append('compressionLevel', level);
  
  if (onProgress) {
    onProgress(5, 'Preparing file for compression...');
  }
  
  const resp = await request.post({ 
    entity: 'compress/pdf', 
    jsonData: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        // Calculate upload progress based on actual bytes uploaded
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85); // 85% for upload
        onProgress(5 + uploadProgress, `Uploading file... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
      }
    }
  });
  
  if (onProgress) {
    onProgress(95, 'Processing file on server...');
  }
  
  // Simulate a small delay for server processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (onProgress) {
    onProgress(100, 'Compression completed');
  }
  
  return toClientResult(resp);
};

// Convert PDF
export const convertPdf = async (input, options = {}, onProgress) => {
  const { conversionType } = options || {};
  
  if (conversionType === 'doc-to-pdf') {
    const formData = createFormDataWithProgress(input, options, onProgress);
    if (onProgress) onProgress(5, 'Preparing document for conversion...');
    
    const resp = await request.post({ 
      entity: 'convert/doc-to-pdf', 
      jsonData: formData,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85);
          onProgress(5 + uploadProgress, `Uploading document... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
        }
      }
    });
    
    if (onProgress) onProgress(95, 'Processing document on server...');
    await new Promise(resolve => setTimeout(resolve, 500));
    if (onProgress) onProgress(100, 'Conversion completed');
    return toClientResult(resp);
  }

  if (conversionType === 'pdf-to-jpg') {
    const formData = createFormDataWithProgress(input, options, onProgress);
    if (onProgress) onProgress(5, 'Preparing PDF for conversion...');
    
    const resp = await request.post({ 
      entity: 'convert/pdf-to-jpg', 
      jsonData: formData,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85);
          onProgress(5 + uploadProgress, `Uploading PDF... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
        }
      }
    });
    
    if (onProgress) onProgress(95, 'Processing PDF on server...');
    await new Promise(resolve => setTimeout(resolve, 500));
    if (onProgress) onProgress(100, 'Conversion completed');
    return toClientResult(resp);
  }

  if (conversionType === 'image-to-pdf') {
    const formData = createFormDataWithProgress(input, options, onProgress);
    if (onProgress) onProgress(5, 'Preparing images for conversion...');
    
    const resp = await request.post({ 
      entity: 'convert/image-to-pdf', 
      jsonData: formData,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85);
          onProgress(5 + uploadProgress, `Uploading images... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
        }
      }
    });
    
    if (onProgress) onProgress(95, 'Processing images on server...');
    await new Promise(resolve => setTimeout(resolve, 500));
    if (onProgress) onProgress(100, 'Conversion completed');
    return toClientResult(resp);
  }

  if (conversionType === 'pdf-to-pptx') {
    const formData = createFormDataWithProgress(input, options, onProgress);
    if (onProgress) onProgress(5, 'Preparing PDF for conversion...');
    
    const resp = await request.post({ 
      entity: 'convert/pdf-to-pptx', 
      jsonData: formData,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85);
          onProgress(5 + uploadProgress, `Uploading PDF... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
        }
      }
    });
    
    if (onProgress) onProgress(95, 'Processing PDF on server...');
    await new Promise(resolve => setTimeout(resolve, 500));
    if (onProgress) onProgress(100, 'Conversion completed');
    return toClientResult(resp);
  }

  return { success: false, error: 'Unknown conversion type' };
};

// Protect PDF
export const protectPdf = async (file, options = {}, onProgress) => {
  const formData = createFormDataWithProgress(file, options, onProgress);
  if (options.PASSWORD) formData.append('PASSWORD', options.PASSWORD);
  
  if (onProgress) {
    onProgress(5, 'Preparing file for protection...');
  }
  
  const resp = await request.post({ 
    entity: 'protect/pdf', 
    jsonData: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85);
        onProgress(5 + uploadProgress, `Uploading file... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
      }
    }
  });
  
  if (onProgress) {
    onProgress(95, 'Processing file on server...');
  }
  
  // Simulate a small delay for server processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (onProgress) {
    onProgress(100, 'Protection completed');
  }
  
  return toClientResult(resp);
};

// Unlock PDF
export const unlockPdf = async (file, options = {}, onProgress) => {
  const formData = createFormDataWithProgress(file, options, onProgress);
  if (options.PASSWORD) formData.append('PASSWORD', options.PASSWORD);
  
  if (onProgress) {
    onProgress(5, 'Preparing file for unlock...');
  }
  
  const resp = await request.post({ 
    entity: 'unlock/pdf', 
    jsonData: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85);
        onProgress(5 + uploadProgress, `Uploading file... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
      }
    }
  });
  
  if (onProgress) {
    onProgress(95, 'Processing file on server...');
  }
  
  // Simulate a small delay for server processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (onProgress) {
    onProgress(100, 'Unlock completed');
  }
  
  return toClientResult(resp);
};

// Rotate PDF
export const rotatePdf = async (file, options = {}, onProgress) => {
  const formData = createFormDataWithProgress(file, options, onProgress);
  if (options.angle !== undefined) formData.append('angle', options.angle);
  
  if (onProgress) {
    onProgress(5, 'Preparing file for rotation...');
  }
  
  const resp = await request.post({ 
    entity: 'rotate/pdf', 
    jsonData: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85);
        onProgress(5 + uploadProgress, `Uploading file... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
      }
    }
  });
  
  if (onProgress) {
    onProgress(95, 'Processing file on server...');
  }
  
  // Simulate a small delay for server processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (onProgress) {
    onProgress(100, 'Rotation completed');
  }
  
  return toClientResult(resp);
};

// Add watermark to PDF
export const addWatermark = async (file, options = {}, onProgress) => {
  const formData = createFormDataWithProgress(file, options, onProgress);
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
  
  if (onProgress) {
    onProgress(5, 'Preparing file for watermark...');
  }
  
  // Only text watermark supported from current form
  if (watermarkType === 'text') {
    if (text) formData.append('text', text);
    if (position) formData.append('position', position);
    if (transparency !== undefined) formData.append('transparency', transparency);
    if (rotation !== undefined) formData.append('rotation', rotation);
    if (layer) formData.append('layer', layer);
    if (fromPage !== undefined) formData.append('fromPage', fromPage);
    if (toPage !== undefined) formData.append('toPage', toPage);
    if (fontFamily) formData.append('fontFamily', fontFamily);
    if (fontSize) formData.append('fontSize', fontSize);
    if (Array.isArray(textColor)) formData.append('textColor', JSON.stringify(textColor));
    
    const resp = await request.post({ 
      entity: 'watermark/text', 
      jsonData: formData,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85);
          onProgress(5 + uploadProgress, `Uploading file... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
        }
      }
    });
    
    if (onProgress) {
      onProgress(95, 'Processing file on server...');
    }
    
    // Simulate a small delay for server processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (onProgress) {
      onProgress(100, 'Watermark added');
    }
    
    return toClientResult(resp);
  }
  return { success: false, error: 'Unsupported watermark type' };
};

// Add page numbers to PDF
export const addPageNumbers = async (file, options = {}, onProgress) => {
  const formData = createFormDataWithProgress(file, options, onProgress);
  const {
    pageMode,
    firstPageCover,
    position,
    margin,
    firstNumber,
    fromPage,
    toPage,
    textStyle,
    fontFamily,
    fontSize,
    textColor,
  } = options;
  if (pageMode) formData.append('pageMode', pageMode);
  if (firstPageCover !== undefined) formData.append('firstPageCover', firstPageCover);
  if (position) formData.append('position', position);
  if (margin) formData.append('margin', margin);
  if (firstNumber !== undefined) formData.append('firstNumber', firstNumber);
  if (fromPage !== undefined) formData.append('fromPage', fromPage);
  if (toPage !== undefined) formData.append('toPage', toPage);
  if (textStyle !== undefined) formData.append('textStyle', textStyle);
  if (fontFamily) formData.append('fontFamily', fontFamily);
  if (fontSize) formData.append('fontSize', fontSize);
  if (Array.isArray(textColor)) formData.append('textColor', JSON.stringify(textColor));
  
  if (onProgress) {
    onProgress(5, 'Preparing file for page numbers...');
  }
  
  const resp = await request.post({ 
    entity: 'page-numbers/pdf', 
    jsonData: formData,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 85);
        onProgress(5 + uploadProgress, `Uploading file... ${Math.round((progressEvent.loaded / progressEvent.total) * 100)}%`);
      }
    }
  });
  
  if (onProgress) {
    onProgress(95, 'Processing file on server...');
  }
  
  // Simulate a small delay for server processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (onProgress) {
    onProgress(100, 'Page numbers added');
  }
  
  return toClientResult(resp);
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
