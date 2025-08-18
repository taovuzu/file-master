export const selectPdf = (state) => state.pdf;
export const selectPdfFiles = (state) => state.pdf.currentFiles;
export const selectPdfProcessedFile = (state) => state.pdf.processedFile;
export const selectPdfIsProcessing = (state) => state.pdf.isProcessing;
export const selectPdfProgress = (state) => state.pdf.processingProgress;
export const selectPdfHistory = (state) => state.pdf.processingHistory;
export const selectPdfError = (state) => state.pdf.error;
export const selectPdfSettings = (state) => state.pdf.settings;


