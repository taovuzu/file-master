import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { message } from 'antd';
import { request } from '@/request';

// Initial state
const initialState = {
  currentFiles: [],
  processedFile: null,
  isProcessing: false,
  processingProgress: 0,
  processingHistory: [],
  error: null,
  settings: {
    compressionLevel: 'medium',
    watermarkPosition: 'center',
    watermarkOpacity: 0.5,
    defaultFormat: 'pdf'
  }
};

// Action types
const PDF_ACTIONS = {
  SET_FILES: 'SET_FILES',
  ADD_FILE: 'ADD_FILE',
  REMOVE_FILE: 'REMOVE_FILE',
  CLEAR_FILES: 'CLEAR_FILES',
  SET_PROCESSED_FILE: 'SET_PROCESSED_FILE',
  SET_PROCESSING: 'SET_PROCESSING',
  SET_PROGRESS: 'SET_PROGRESS',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

// Reducer
const pdfReducer = (state, action) => {
  switch (action.type) {
    case PDF_ACTIONS.SET_FILES:
      return {
        ...state,
        currentFiles: action.payload,
        error: null
      };

    case PDF_ACTIONS.ADD_FILE:
      return {
        ...state,
        currentFiles: [...state.currentFiles, action.payload],
        error: null
      };

    case PDF_ACTIONS.REMOVE_FILE:
      return {
        ...state,
        currentFiles: state.currentFiles.filter(file => file.uid !== action.payload),
        error: null
      };

    case PDF_ACTIONS.CLEAR_FILES:
      return {
        ...state,
        currentFiles: [],
        processedFile: null,
        error: null
      };

    case PDF_ACTIONS.SET_PROCESSED_FILE:
      return {
        ...state,
        processedFile: action.payload,
        error: null
      };

    case PDF_ACTIONS.SET_PROCESSING:
      return {
        ...state,
        isProcessing: action.payload,
        error: null
      };

    case PDF_ACTIONS.SET_PROGRESS:
      return {
        ...state,
        processingProgress: action.payload
      };

    case PDF_ACTIONS.ADD_TO_HISTORY:
      return {
        ...state,
        processingHistory: [action.payload, ...state.processingHistory.slice(0, 9)] // Keep last 10
      };

    case PDF_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
        processingProgress: 0
      };

    case PDF_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case PDF_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    default:
      return state;
  }
};

// Create context
const PdfContext = createContext();

// Provider component
export const PdfProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pdfReducer, initialState);

  // Actions
  const setFiles = useCallback((files) => {
    dispatch({ type: PDF_ACTIONS.SET_FILES, payload: files });
  }, []);

  const addFile = useCallback((file) => {
    dispatch({ type: PDF_ACTIONS.ADD_FILE, payload: file });
  }, []);

  const removeFile = useCallback((fileId) => {
    dispatch({ type: PDF_ACTIONS.REMOVE_FILE, payload: fileId });
  }, []);

  const clearFiles = useCallback(() => {
    dispatch({ type: PDF_ACTIONS.CLEAR_FILES });
  }, []);

  const setProcessedFile = useCallback((file) => {
    dispatch({ type: PDF_ACTIONS.SET_PROCESSED_FILE, payload: file });
  }, []);

  const setProcessing = useCallback((isProcessing) => {
    dispatch({ type: PDF_ACTIONS.SET_PROCESSING, payload: isProcessing });
  }, []);

  const setProgress = useCallback((progress) => {
    dispatch({ type: PDF_ACTIONS.SET_PROGRESS, payload: progress });
  }, []);

  const addToHistory = useCallback((operation) => {
    dispatch({ type: PDF_ACTIONS.ADD_TO_HISTORY, payload: operation });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: PDF_ACTIONS.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: PDF_ACTIONS.CLEAR_ERROR });
  }, []);

  const updateSettings = useCallback((settings) => {
    dispatch({ type: PDF_ACTIONS.UPDATE_SETTINGS, payload: settings });
  }, []);

  // PDF Operations
  const processPdf = useCallback(async (operation, options = {}) => {
    if (state.currentFiles.length === 0) {
      setError('No files selected');
      return { success: false, message: 'No files selected' };
    }

    setProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      
      if (state.currentFiles.length > 1) {
        state.currentFiles.forEach((file) => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', state.currentFiles[0]);
      }

      // Add options to formData
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await request.createAndUpload({
        entity: operation,
        jsonData: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (result?.fileUrl) {
        setProcessedFile(result.fileUrl);
        
        // Add to history
        addToHistory({
          id: Date.now(),
          operation,
          files: state.currentFiles.map(f => f.name),
          result: result.fileUrl,
          timestamp: new Date().toISOString()
        });

        message.success(`${operation} completed successfully!`);
        return { success: true, data: result };
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      setError(error.message || 'Processing failed');
      message.error('An error occurred during processing');
      return { success: false, message: error.message };
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, [state.currentFiles, setProcessing, setProgress, setProcessedFile, setError, addToHistory]);

  const downloadFile = useCallback((fileUrl, fileName) => {
    if (!fileUrl) {
      message.error('No file to download');
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'processed-document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Download started');
  }, []);

  const value = {
    // State
    ...state,
    
    // Actions
    setFiles,
    addFile,
    removeFile,
    clearFiles,
    setProcessedFile,
    setProcessing,
    setProgress,
    addToHistory,
    setError,
    clearError,
    updateSettings,
    
    // Operations
    processPdf,
    downloadFile
  };

  return (
    <PdfContext.Provider value={value}>
      {children}
    </PdfContext.Provider>
  );
};

// Hook to use the context
export const usePdfContext = () => {
  const context = useContext(PdfContext);
  if (!context) {
    throw new Error('usePdfContext must be used within a PdfProvider');
  }
  return context;
};
