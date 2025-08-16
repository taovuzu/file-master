import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Typography, Space, Alert, Divider } from 'antd';
import { DownloadOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { usePdfTools } from '@/hooks/usePdfTools';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTool, setCurrentFiles, addToHistory } from '@/redux/pdfTools';
import FileUploadZone from './FileUploadZone';
import PdfPreview from './PdfPreview';
import usePdfPreview from '@/hooks/usePdfPreview';

const { Title, Text, Paragraph } = Typography;

const EnhancedPdfToolPage = ({
  title,
  description,
  toolType,
  FormComponent,
  requirements = null,
  children,
}) => {
  const [fileList, setFileList] = useState([]);
  const [formValues, setFormValues] = useState({});
  
  const dispatch = useDispatch();
  const { currentTool, processing, error: reduxError } = useSelector((state) => state.pdfTools);
  
  const {
    loading,
    processedFile,
    error: hookError,
    isLoggedIn,
    processPdfTool,
    downloadProcessedFile,
    reset,
    validateFiles,
  } = usePdfTools(toolType);

  const { pageImages, loading: previewLoading } = usePdfPreview(
    requirements.multipleFiles ? fileList : fileList[0]
  );

  // Set current tool in Redux when component mounts
  useEffect(() => {
    dispatch(setCurrentTool(toolType));
  }, [dispatch, toolType]);

  // Handle file selection
  const handleFilesSelected = (files) => {
    const validation = validateFiles(files, requirements);
    if (!validation.valid) {
      message.error(validation.error);
      return;
    }
    
    setFileList(files);
    dispatch(setCurrentFiles(files));
  };

  // Handle file removal
  const handleFileRemove = (removedFile) => {
    const newFileList = fileList.filter((file) => file !== removedFile);
    setFileList(newFileList);
    dispatch(setCurrentFiles(newFileList));
  };

  // Handle form submission
  const handleFormSubmit = async (values) => {

    if (fileList.length === 0) {
      message.error('Please select files to process');
      return;
    }

    setFormValues(values);
    
    try {
      const result = await processPdfTool(fileList, values);
      
      if (result.success) {
        // Add to Redux history
        dispatch(addToHistory({
          operation: toolType,
          files: fileList.map(f => f.name),
          result: result.data.fileUrl,
          options: values,
        }));
        
        message.success(`${title} completed successfully!`);
      }
    } catch (err) {
      console.error('Processing error:', err);
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
    dispatch(setCurrentFiles([]));
    message.info('Tool reset successfully');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            <FileTextOutlined style={{ marginRight: '8px' }} />
            {title}
          </Title>
          <Paragraph type="secondary" style={{ fontSize: '16px', marginBottom: '16px' }}>
            {description}
          </Paragraph>
          
          {/* {requirements && (
            <Alert
              message="Requirements"
              description={
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {requirements.minFiles && <li>Minimum {requirements.minFiles} file(s) required</li>}
                  {requirements.maxFiles && <li>Maximum {requirements.maxFiles} files allowed</li>}
                  {requirements.maxSize && <li>Maximum file size: {requirements.maxSize}MB</li>}
                  <li>Only PDF files accepted</li>
                </ul>
              }
              type="info"
              showIcon
              style={{ maxWidth: 600, margin: '0 auto' }}
            />
          )} */}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column - File Upload and Form */}
        <div>
          {/* File Upload */}
          <Card title="Upload Files" style={{ marginBottom: '24px' }}>
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              onFileRemove={handleFileRemove}
              fileList={fileList}
              multiple={requirements.multipleFiles}
              maxFiles={requirements.maxFiles}
              accept=".pdf"
            />
          </Card>

          {/* Form Component */}
          {FormComponent && (
            <Card title="Options" style={{ marginBottom: '24px' }}>
              <FormComponent
                onFinish={handleFormSubmit}
                loading={loading || processing}
                fileList={fileList}
                requirements={requirements}
              />
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <Space size="middle">
              <Button
                type="primary"
                size="large"
                onClick={() => handleFormSubmit(formValues)}
                loading={loading || processing}
                disabled={fileList.length === 0}
                icon={<FileTextOutlined />}
              >
                Process {toolType}
              </Button>
              
              {processedFile && (
                <Button
                  type="default"
                  size="large"
                  onClick={handleDownload}
                  icon={<DownloadOutlined />}
                >
                  Download
                </Button>
              )}
              
              <Button
                size="large"
                onClick={handleReset}
                icon={<ReloadOutlined />}
              >
                Reset
              </Button>
            </Space>
          </Card>
        </div>

        {/* Right Column - Preview and Results */}
        <div>
          {/* PDF Preview */}
          {fileList.length > 0 && (
            <Card title="File Preview" style={{ marginBottom: '24px' }}>
              <PdfPreview
                pageImages={pageImages}
                loading={previewLoading}
                fileCount={fileList.length}
              />
            </Card>
          )}

          {/* Processing Status */}
          {(loading || processing) && (
            <Card title="Processing Status">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
                <Paragraph style={{ marginTop: '16px' }}>
                  Processing your PDF... Please wait.
                </Paragraph>
              </div>
            </Card>
          )}

          {/* Results */}
          {processedFile && (
            <Card title="Processing Complete" style={{ marginBottom: '24px' }}>
              <Alert
                message="Success!"
                description="Your PDF has been processed successfully. You can now download the result."
                type="success"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              <Button
                type="primary"
                size="large"
                block
                onClick={handleDownload}
                icon={<DownloadOutlined />}
              >
                Download Processed File
              </Button>
            </Card>
          )}

          {/* Error Display */}
          {(reduxError || hookError) && (
            <Card title="Error" style={{ marginBottom: '24px' }}>
              <Alert
                message="Processing Failed"
                description={reduxError || hookError}
                type="error"
                showIcon
              />
            </Card>
          )}
        </div>
      </div>

      {/* Custom Children */}
      {children && (
        <>
          <Divider />
          {children}
        </>
      )}
    </div>
  );
};

export default EnhancedPdfToolPage;
