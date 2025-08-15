import { PDF_ACTIONS } from "./types";

export const setFiles = (files) => ({
  type: PDF_ACTIONS.SET_FILES,
  payload: files,
});
export const addFile = (file) => ({
  type: PDF_ACTIONS.ADD_FILE,
  payload: file,
});
export const removeFile = (fileId) => ({
  type: PDF_ACTIONS.REMOVE_FILE,
  payload: fileId,
});
export const clearFiles = () => ({ type: PDF_ACTIONS.CLEAR_FILES });
export const setProcessedFile = (file) => ({
  type: PDF_ACTIONS.SET_PROCESSED_FILE,
  payload: file,
});
export const setProcessing = (isProcessing) => ({
  type: PDF_ACTIONS.SET_PROCESSING,
  payload: isProcessing,
});
export const setProgress = (progress) => ({
  type: PDF_ACTIONS.SET_PROGRESS,
  payload: progress,
});
export const addToHistory = (operation) => ({
  type: PDF_ACTIONS.ADD_TO_HISTORY,
  payload: operation,
});
export const setError = (error) => ({
  type: PDF_ACTIONS.SET_ERROR,
  payload: error,
});
export const clearError = () => ({ type: PDF_ACTIONS.CLEAR_ERROR });
export const updateSettings = (settings) => ({
  type: PDF_ACTIONS.UPDATE_SETTINGS,
  payload: settings,
});
