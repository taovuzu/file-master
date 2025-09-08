import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Alert,
  Divider,
  Progress } from
"antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  FileTextOutlined,
  InfoCircleOutlined } from
"@ant-design/icons";
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
  children
}) => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [rotationMap, setRotationMap] = useState({ byId: {}, byName: {} });


  let {
    progress,
    status,
    currentStep,
    error: progressError,
    isPolling,
    pollingAttempts,
    maxPollingAttempts,
    startProgress,
    updateProgress,
    setProgressError,
    startPolling,
    updatePollingAttempts,
    setPollingFailed,
    resetProgress,
    abort,
    getElapsedTime,
    formatTime,
    isAborted,
    abortSignal
  } = useProgress();

  const dispatch = useDispatch();
  const {
    currentTool,
    processing,
    error: reduxError
  } = useSelector((state) => state.pdfTools);

  const {
    loading,
    processedFile,
    error: hookError,
    jobId,
    processPdfTool,
    downloadProcessedFile,
    checkJobStatus,
    reset,
    validateFiles
  } = usePdfTools(toolType);


  const { rotatePdfBlob } = usePdfPreview(
    fileList.length > 0 ? fileList : null
  );


  useEffect(() => {
    dispatch(setCurrentTool(toolType));
  }, [dispatch, toolType]);


  const handleFilesSelected = (files) => {
    const validation = validateFiles(files, requirements);
    if (!validation.valid) {
      notify.error(validation.error, 'validation');
      return;
    }

    setFileList(files);
  };


  const handleFileRemove = (removedFile) => {
    const newFileList = fileList.filter((file) => file !== removedFile);
    setFileList(newFileList);
  };


  const handleFormSubmit = async (values) => {
    if (fileList.length === 0) {
      notify.error("Please select files to process", 'select-files');
      return;
    }

    setFormValues(values);

    try {

      const input = requirements?.multipleFiles ? fileList : fileList[0];


      startProgress("Preparing files...");


      let processedInput = input;

      if (rotationMap.byName && Object.keys(rotationMap.byName).length > 0) {
        if (requirements?.multipleFiles) {
          processedInput = await Promise.all(
            fileList.map(async (file) => {
              const rotation = rotationMap.byName[file.name] || 0;
              if (rotation !== 0 && file.type === "application/pdf") {
                const rotated = await rotatePdfBlob(file, rotation);
                return new File([rotated], file.name, {
                  type: "application/pdf"
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
              type: "application/pdf"
            });
          }
        }
      }

      updateProgress(15, "Uploading files...");

      const result = await processPdfTool(
        processedInput,
        values,
        updateProgress,
        () => startPolling(150),
        abortSignal
      );


      if (!result.success) {
        setProgressError(result.error || "Processing failed");
        return;
      }

      if (result.success) {
        const resultData = result.data;


        dispatch(
          addToHistory({
            operation: toolType,
            files: fileList.map((f) => f.name),
            result: resultData.fileUrl,
            options: values,
            jobId: jobId,
            originalFileName: resultData.originalFileName,
            timestamp: new Date().toISOString()
          })
        );


        updateProgress(100, "Processing completed successfully!");


        if (resultData.error) {
          setProgressError(resultData.error);
          return;
        }


        if (resultData.file || resultData.fileUrl) {
          const serverFile = resultData.file || (
          resultData.fileUrl ? decodeURIComponent(resultData.fileUrl.split("/").pop() || "") : "");

          const extMatch = serverFile && serverFile.includes(".") ?
          serverFile.substring(serverFile.lastIndexOf(".")) :
          ".pdf";

          const suggestedName = resultData.originalFileName ||
          `processed-${toolType}-${Date.now()}${extMatch}`;


          notify.success(
            `Your ${toolType} operation completed successfully! Redirecting to download page...`,
            'operation-complete'
          );



          setTimeout(() => {

            updateProgress(100, "Redirecting to download page...");


            const downloadParams = new URLSearchParams({
              file: resultData.file || '',
              url: resultData.fileUrl || '',
              name: resultData.originalFileName || suggestedName,
              operation: toolType
            });

            navigate(`/download?${downloadParams.toString()}`);
          }, 1500);
        } else {
          setProgressError(resultData.error || "Processing failed");
        }
      }
    } catch (err) {


      let errorMessage = err.message || "An error occurred during processing";

      if (errorMessage.includes('Job polling timeout exceeded')) {
        errorMessage = 'Processing took too long and timed out. Please try again with a smaller file or contact support.';
      } else if (errorMessage.includes('Unable to check job status')) {
        errorMessage = 'Connection issue detected. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (errorMessage.includes('API returned error')) {
        errorMessage = 'Server processing failed. Please try again or contact support if the issue persists.';
      }


      setProgressError(errorMessage);
    }
  };

  return (
    <>
      <Header />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {}
        <div style={{ flex: 1, padding: "24px", maxWidth: "100%" }}>
          {}
          {(!fileList || fileList.length === 0) &&
          <div style={{ textAlign: "center" }}>
              <Title level={2} style={{ marginBottom: "8px" }}>
                <FileTextOutlined style={{ marginRight: "8px" }} />
                {title}
              </Title>
              <Paragraph
              type="secondary"
              style={{ fontSize: "16px", marginBottom: "16px" }}>
              
                {description}
              </Paragraph>
            </div>
          }

          {}
          <div className="flex items-start justify-center w-full h-full">
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              onFileRemove={handleFileRemove}
              onRotationMapChange={setRotationMap}
              fileList={fileList}
              multiple={requirements.multipleFiles}
              maxFiles={requirements.maxFiles}
              acceptedTypes={requirements.acceptedTypes || ["application/pdf"]} />
            
          </div>
          
          {}
          {children &&
          <>
              <Divider />
              {children}
            </>
          }
        </div>

        {}
        {fileList && fileList.length !== 0 &&
        <SideBar
          form={
          FormComponent &&
          <FormComponent
            onFinish={handleFormSubmit}
            loading={loading || processing}
            file={fileList?.[0]}
            fileList={fileList}
            requirements={requirements} />


          } />

        }
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
        isPolling={isPolling}
        pollingAttempts={pollingAttempts}
        maxPollingAttempts={maxPollingAttempts} />
      
      
      {(!fileList || fileList.length === 0) && <Footer />}
    </>);

};

export default PdfToolPage;