import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { message } from "antd";
import { request } from "@/request";
import { pdfReducer, initialState } from "./reducer";
import * as actions from "./actions";

const PdfContext = createContext();

export const PdfProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pdfReducer, initialState);

  // Bind action creators
  const boundActions = {};
  for (const [name, actionCreator] of Object.entries(actions)) {
    boundActions[name] = useCallback(
      (...args) => dispatch(actionCreator(...args)),
      []
    );
  }

  const processPdf = useCallback(
    async (operation, options = {}) => {
      if (state.currentFiles.length === 0) {
        boundActions.setError("No files selected");
        return { success: false, message: "No files selected" };
      }

      boundActions.setProcessing(true);
      boundActions.setProgress(0);

      try {
        const formData = new FormData();
        if (state.currentFiles.length > 1) {
          state.currentFiles.forEach((file) => formData.append("files", file));
        } else {
          formData.append("file", state.currentFiles[0]);
        }

        Object.entries(options).forEach(([k, v]) => formData.append(k, v));

        const progressInterval = setInterval(() => {
          boundActions.setProgress((prev) => {
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
        boundActions.setProgress(100);

        if (result?.fileUrl) {
          boundActions.setProcessedFile(result.fileUrl);
          boundActions.addToHistory({
            id: Date.now(),
            operation,
            files: state.currentFiles.map((f) => f.name),
            result: result.fileUrl,
            timestamp: new Date().toISOString(),
          });
          message.success(`${operation} completed successfully!`);
          return { success: true, data: result };
        } else {
          throw new Error("Processing failed");
        }
      } catch (err) {
        boundActions.setError(err.message || "Processing failed");
        message.error("An error occurred during processing");
        return { success: false, message: err.message };
      } finally {
        boundActions.setProcessing(false);
        boundActions.setProgress(0);
      }
    },
    [state.currentFiles]
  );

  const downloadFile = useCallback((fileUrl, fileName) => {
    if (!fileUrl) {
      message.error("No file to download");
      return;
    }
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "processed-document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Download started");
  }, []);

  return (
    <PdfContext.Provider
      value={{ ...state, ...boundActions, processPdf, downloadFile }}
    >
      {children}
    </PdfContext.Provider>
  );
};

export const usePdfContext = () => {
  const context = useContext(PdfContext);
  if (!context)
    throw new Error("usePdfContext must be used within a PdfProvider");
  return context;
};
