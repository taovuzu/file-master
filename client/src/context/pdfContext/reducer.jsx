import { PDF_ACTIONS } from "./types";

export const initialState = {
  currentFiles: [],
  processedFile: null,
  isProcessing: false,
  processingProgress: 0,
  processingHistory: [],
  error: null,
  settings: {
    compressionLevel: "medium",
    watermarkPosition: "center",
    watermarkOpacity: 0.5,
    defaultFormat: "pdf",
  },
};

export const pdfReducer = (state, action) => {
  switch (action.type) {
    case PDF_ACTIONS.SET_FILES:
      return { ...state, currentFiles: action.payload, error: null };
    case PDF_ACTIONS.ADD_FILE:
      return {
        ...state,
        currentFiles: [...state.currentFiles, action.payload],
        error: null,
      };
    case PDF_ACTIONS.REMOVE_FILE:
      return {
        ...state,
        currentFiles: state.currentFiles.filter(
          (f) => f.uid !== action.payload
        ),
        error: null,
      };
    case PDF_ACTIONS.CLEAR_FILES:
      return { ...state, currentFiles: [], processedFile: null, error: null };
    case PDF_ACTIONS.SET_PROCESSED_FILE:
      return { ...state, processedFile: action.payload, error: null };
    case PDF_ACTIONS.SET_PROCESSING:
      return { ...state, isProcessing: action.payload, error: null };
    case PDF_ACTIONS.SET_PROGRESS:
      return { ...state, processingProgress: action.payload };
    case PDF_ACTIONS.ADD_TO_HISTORY:
      return {
        ...state,
        processingHistory: [
          action.payload,
          ...state.processingHistory.slice(0, 9),
        ],
      };
    case PDF_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
        processingProgress: 0,
      };
    case PDF_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case PDF_ACTIONS.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
};
