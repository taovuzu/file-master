import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Alert,
  Divider,
  Progress,
} from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { usePdfTools } from "@/hooks/usePdfTools";
import usePdfPreview from "@/hooks/usePdfPreview";
import { useProgress } from "@/hooks/useProgress";
import { useDispatch, useSelector } from "react-redux";
import notify from '@/utils/notify';
import { setCurrentTool, addToHistory } from "@/redux/pdfTools";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SideBar from "@/components/Sidebar";
import FileUploadZone from "@/components/FileUploadZone";
import ProgressModal from "@/components/ProgressModal";

const { Title, Text, Paragraph } = Typography;

const PdfToolPage = ({
  title,
  description,
  toolType,
  FormComponent,
  requirements = null,
  children,
}) => {
  const [fileList, setFileList] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [rotationMap, setRotationMap] = useState({ byId: {}, byName: {} });

  // Progress tracking
  let {
    progress,
    status,
    currentStep,
    error: progressError,
    startProgress,
    updateProgress,
    setProgressError,
    resetProgress,
    abort,
    getElapsedTime,
    formatTime,
    isAborted,
  } = useProgress();

  const dispatch = useDispatch();
  const {
    currentTool,
    processing,
    error: reduxError,
  } = useSelector((state) => state.pdfTools);

  const {
    loading,
    processedFile,
    error: hookError,
    processPdfTool,
    downloadProcessedFile,
    reset,
    validateFiles,
  } = usePdfTools(toolType);

  // Get rotation function from usePdfPreview - only pass files when they exist
  const { rotatePdfBlob } = usePdfPreview(
    fileList.length > 0 ? fileList : null
  );

  // Set current tool in Redux when component mounts
  useEffect(() => {
    dispatch(setCurrentTool(toolType));
  }, [dispatch, toolType]);

  // Handle file selection
  const handleFilesSelected = (files) => {
    const validation = validateFiles(files, requirements);
    if (!validation.valid) {
      notify.error(validation.error, 'validation');
      return;
    }

    setFileList(files);
  };

  // Handle file removal
  const handleFileRemove = (removedFile) => {
    const newFileList = fileList.filter((file) => file !== removedFile);
    setFileList(newFileList);
  };

  // Handle form submission
  const handleFormSubmit = async (values) => {
    if (fileList.length === 0) {
      notify.error("Please select files to process", 'select-files');
      return;
    }

    setFormValues(values);

    try {
      // Pass files based on requirements
      const input = requirements?.multipleFiles ? fileList : fileList[0];

      // Start progress tracking
      startProgress("Preparing files...");

      // Apply rotations to PDFs before sending to server
      let processedInput = input;

      if (rotationMap.byName && Object.keys(rotationMap.byName).length > 0) {
        if (requirements?.multipleFiles) {
          processedInput = await Promise.all(
            fileList.map(async (file) => {
              const rotation = rotationMap.byName[file.name] || 0;
              if (rotation !== 0 && file.type === "application/pdf") {
                const rotated = await rotatePdfBlob(file, rotation);
                return new File([rotated], file.name, {
                  type: "application/pdf",
                });
              }
              return file;
            })
          );
        } else {
          const file = fileList[0];
          const rotation = rotationMap.byName[file.name] || 0;
          if (rotation !== 0 && file.type === "application/pdf") {
            const rotated = await rotatePdfBlob(file, rotation);
            processedInput = new File([rotated], file.name, {
              type: "application/pdf",
            });
          }
        }
      }
      updateProgress(15, "Uploading files...");
      // Process the files with progress tracking
      const result = await processPdfTool(
        processedInput,
        values,
        updateProgress
      );

      if (result.success) {
        const resultData = result.data;
        // Add to Redux history
        dispatch(
          addToHistory({
            operation: toolType,
            files: fileList.map((f) => f.name),
            result: resultData.fileUrl,
            options: values,
          })
        );

        // Redirect to frontend download page with file param, avoid exposing backend URL
        updateProgress(100, "Processing completed");
        if (resultData.file || resultData.fileUrl) {
          const serverFile =
            resultData.file ||
            (resultData.fileUrl
              ? decodeURIComponent(resultData.fileUrl.split("/").pop() || "")
              : "");
          const extMatch =
            serverFile && serverFile.includes(".")
              ? serverFile.substring(serverFile.lastIndexOf("."))
              : ".pdf";
          const suggestedName = `processed-${toolType}-${Date.now()}${extMatch}`;
          const params = new URLSearchParams();
          if (resultData.file) params.set("file", resultData.file);
          else params.set("url", resultData.fileUrl);
          params.set("name", suggestedName);
          console.log(`/download?${params.toString()}`);
          window.location.assign(`/download?${params.toString()}`);
        } else {
          setProgressError(resultData.error || "Processing failed");
        }
      }
    } catch (err) {
      console.error("Processing error:", err);
      setProgressError(err.message || "An error occurred during processing");
    }
  };

  // Handle download
  const handleDownload = () => {
    if (processedFile) {
      const fileName = `processed-${toolType}-${Date.now()}.pdf`;
      downloadProcessedFile(fileName);
    }
  };

  // Handle reset
  const handleReset = () => {
    setFileList([]);
    setFormValues({});
    reset();
    // keep Redux state serializable; do not store File objects
    notify.info("Tool reset successfully", 'tool-reset');
  };

  return (
    <>
      <Header />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Main Content */}
        <div style={{ flex: 1, padding: "24px", maxWidth: "100%" }}>
          {/* Header */}
          {(!fileList || fileList.length === 0) && (
            <div style={{ textAlign: "center" }}>
              <Title level={2} style={{ marginBottom: "8px" }}>
                <FileTextOutlined style={{ marginRight: "8px" }} />
                {title}
              </Title>
              <Paragraph
                type="secondary"
                style={{ fontSize: "16px", marginBottom: "16px" }}
              >
                {description}
              </Paragraph>
            </div>
          )}

          {/*Upload */}
          <div className="flex items-start justify-center w-full h-full">
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              onFileRemove={handleFileRemove}
              onRotationMapChange={setRotationMap}
              fileList={fileList}
              multiple={requirements.multipleFiles}
              maxFiles={requirements.maxFiles}
              acceptedTypes={requirements.acceptedTypes || ["application/pdf"]}
            />
          </div>
          {/* Children */}
          {children && (
            <>
              <Divider />
              {children}
            </>
          )}
        </div>

        {/* Sidebar with Form */}
        {fileList && fileList.length !== 0 && (
          <SideBar
            form={
              FormComponent && (
                <FormComponent
                  onFinish={handleFormSubmit}
                  loading={loading || processing}
                  file={fileList?.[0]}
                  fileList={fileList}
                  requirements={requirements}
                />
              )
            }
          />
        )}
      </div>
      <ProgressModal
        visible={status !== "idle"}
        progress={progress}
        status={status}
        currentStep={currentStep}
        error={progressError}
        onCancel={() => {
          if (status === "uploading" || status === "processing") {
            abort();
          } else {
            resetProgress();
          }
        }}
        onRetry={() => handleFormSubmit(formValues)}
        elapsedTime={getElapsedTime}
        formatTime={formatTime}
        toolType={toolType}
        fileName={fileList[0]?.name || "File"}
      />
      {(!fileList || fileList.length === 0) && <Footer />}
    </>
  );
};

export default PdfToolPage;
