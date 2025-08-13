import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as pdfToolsService from '@/services/pdfToolsService';


export const processPdf = createAsyncThunk(
  'pdfTools/processPdf',
  async ({ toolType, files, options }, { rejectWithValue }) => {
    try {
      let result;


      const multiFileTools = ['merge', 'image-to-pdf'];
      const isMultiFile = multiFileTools.includes(toolType);


      const input = isMultiFile ? files : Array.isArray(files) ? files[0] : files;

      switch (toolType) {
        case 'merge':
          result = await pdfToolsService.mergePdfs(input, options);
          break;
        case 'split':
          result = await pdfToolsService.splitPdf(input, options.ranges || [], options);
          break;
        case 'compress':
          result = await pdfToolsService.compressPdf(input, options);
          break;
        case 'convert':
          result = await pdfToolsService.convertPdf(input, options);
          break;
        case 'protect':
          result = await pdfToolsService.protectPdf(input, options);
          break;
        case 'unlock':
          result = await pdfToolsService.unlockPdf(input, options);
          break;
        case 'rotate':
          result = await pdfToolsService.rotatePdf(input, options);
          break;
        case 'watermark':
          result = await pdfToolsService.addWatermark(input, options);
          break;
        case 'page-numbers':
          result = await pdfToolsService.addPageNumbers(input, options);
          break;
        default:
          throw new Error(`Unknown tool type: ${toolType}`);
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Processing failed');
    }
  }
);

export const downloadFile = createAsyncThunk(
  'pdfTools/downloadFile',
  async ({ fileUrl, fileName }, { rejectWithValue }) => {
    try {
      const result = await pdfToolsService.downloadFile(fileUrl, fileName);
      return result;
    } catch (error) {
      return rejectWithValue(error.message || 'Download failed');
    }
  }
);

const initialState = {
  currentTool: null,
  currentFiles: [],
  processedFile: null,
  processing: false,
  downloading: false,
  error: null,
  history: [],
  settings: {
    autoDownload: false,
    keepHistory: true,
    maxHistoryItems: 50
  }
};

const pdfToolsSlice = createSlice({
  name: 'pdfTools',
  initialState,
  reducers: {
    setCurrentTool: (state, action) => {
      state.currentTool = action.payload;
    },
    setCurrentFiles: (state, action) => {
      state.currentFiles = action.payload;
    },
    addFile: (state, action) => {
      state.currentFiles.push(action.payload);
    },
    removeFile: (state, action) => {
      state.currentFiles = state.currentFiles.filter(
        (file) => file !== action.payload
      );
    },
    clearFiles: (state) => {
      state.currentFiles = [];
    },
    setProcessedFile: (state, action) => {
      state.processedFile = action.payload;
    },
    clearProcessedFile: (state) => {
      state.processedFile = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addToHistory: (state, action) => {
      const newItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };

      state.history.unshift(newItem);


      if (state.history.length > state.settings.maxHistoryItems) {
        state.history = state.history.slice(0, state.settings.maxHistoryItems);
      }
    },
    clearHistory: (state) => {
      state.history = [];
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    reset: (state) => {
      state.currentFiles = [];
      state.processedFile = null;
      state.error = null;
      state.processing = false;
      state.downloading = false;
    }
  },
  extraReducers: (builder) => {
    builder.

    addCase(processPdf.pending, (state) => {
      state.processing = true;
      state.error = null;
    }).
    addCase(processPdf.fulfilled, (state, action) => {
      state.processing = false;
      if (action.payload.success) {
        state.processedFile = action.payload.fileUrl;
        state.error = null;
      } else {
        state.error = action.payload.error || 'Processing failed';
      }
    }).
    addCase(processPdf.rejected, (state, action) => {
      state.processing = false;
      state.error = action.payload || 'Processing failed';
    }).

    addCase(downloadFile.pending, (state) => {
      state.downloading = true;
      state.error = null;
    }).
    addCase(downloadFile.fulfilled, (state) => {
      state.downloading = false;
      state.error = null;
    }).
    addCase(downloadFile.rejected, (state, action) => {
      state.downloading = false;
      state.error = action.payload || 'Download failed';
    });
  }
});

export const {
  setCurrentTool,
  setCurrentFiles,
  addFile,
  removeFile,
  clearFiles,
  setProcessedFile,
  clearProcessedFile,
  setError,
  clearError,
  addToHistory,
  clearHistory,
  updateSettings,
  reset
} = pdfToolsSlice.actions;

export default pdfToolsSlice.reducer;