// PDF state/actions migrated from pdfContext

export const PDF_ACTIONS = {
  SET_FILES: 'pdf/SET_FILES',
  ADD_FILE: 'pdf/ADD_FILE',
  REMOVE_FILE: 'pdf/REMOVE_FILE',
  CLEAR_FILES: 'pdf/CLEAR_FILES',
  SET_PROCESSED_FILE: 'pdf/SET_PROCESSED_FILE',
  SET_PROCESSING: 'pdf/SET_PROCESSING',
  SET_PROGRESS: 'pdf/SET_PROGRESS',
  ADD_TO_HISTORY: 'pdf/ADD_TO_HISTORY',
  SET_ERROR: 'pdf/SET_ERROR',
  CLEAR_ERROR: 'pdf/CLEAR_ERROR',
  UPDATE_SETTINGS: 'pdf/UPDATE_SETTINGS',
};

export const setFiles = (files) => ({ type: PDF_ACTIONS.SET_FILES, payload: files });
export const addFile = (file) => ({ type: PDF_ACTIONS.ADD_FILE, payload: file });
export const removeFile = (fileId) => ({ type: PDF_ACTIONS.REMOVE_FILE, payload: fileId });
export const clearFiles = () => ({ type: PDF_ACTIONS.CLEAR_FILES });
export const setProcessedFile = (file) => ({ type: PDF_ACTIONS.SET_PROCESSED_FILE, payload: file });
export const setProcessing = (isProcessing) => ({ type: PDF_ACTIONS.SET_PROCESSING, payload: isProcessing });
export const setProgress = (progress) => ({ type: PDF_ACTIONS.SET_PROGRESS, payload: progress });
export const addToHistory = (operation) => ({ type: PDF_ACTIONS.ADD_TO_HISTORY, payload: operation });
export const setError = (error) => ({ type: PDF_ACTIONS.SET_ERROR, payload: error });
export const clearError = () => ({ type: PDF_ACTIONS.CLEAR_ERROR });
export const updateSettings = (settings) => ({ type: PDF_ACTIONS.UPDATE_SETTINGS, payload: settings });


