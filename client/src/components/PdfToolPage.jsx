import React, { useState } from "react";
import { Button, message, Spin, Typography, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import FileUploadZone from "./FileUploadZone";
import PdfPreview from "./PdfPreview";
import usePdfPreview from "@/hooks/usePdfPreview";
import { request } from "@/request";
import Footer from "./Footer";
import Header from "./Header";

const { Title, Text } = Typography;

const PdfToolPage = ({
  title,
  description,
  formComponent: FormComponent,
  entity,
  multipleFiles = false,
  maxFiles = 1,
  onProcess,
  downloadFileName,
  showPreview = true,
  children,
}) => {
  const [processedFile, setProcessedFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [fileList, setFileList] = useState([]);

  const handleFilesSelected = (files) => {
    setFileList(files);
  };

  const handleFileRemove = (removedFile) => {
    setFileList((prev) => prev.filter((file) => file !== removedFile));
  };

  const { pageImages, loading: previewLoading } = usePdfPreview(
    multipleFiles ? fileList : fileList[0]
  );

  const handleProcess = async (formValues = {}) => {
    if (!fileList || fileList.length === 0) {
      message.warning(
        `Please upload ${multipleFiles ? "at least one" : "a"} PDF file first.`
      );
      return;
    }

    if (multipleFiles && fileList.length < 2) {
      message.warning("Please upload at least two PDF files.");
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();

      if (multipleFiles) {
        fileList.forEach((file) => formData.append("files", file));
      } else {
        formData.append("file", fileList[0]);
      }

      // Add form values to formData
      Object.keys(formValues).forEach((key) => {
        formData.append(key, formValues[key]);
      });

      let result;

      if (onProcess) {
        // Custom processing function
        result = await onProcess(formData, fileList);
      } else {
        // Default processing using request
        result = await request.createAndUpload({
          entity,
          jsonData: formData,
        });
      }

      if (result?.fileUrl) {
        setProcessedFile(result.fileUrl);
        message.success(`${title} completed successfully!`);
      } else {
        message.error(`${title} failed. Please try again.`);
      }
    } catch (err) {
      console.error(err);
      message.error("An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedFile) {
      const link = document.createElement("a");
      link.href = processedFile;
      link.download =
        downloadFileName || `processed_${fileList[0]?.name || "document.pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={1}>{title}</Title>
            {description && <Text type="secondary">{description}</Text>}
          </div>

          {/* Upload Zone */}
          <div className="max-w-4xl mx-auto">
            <FileUploadZone
              multiple={multipleFiles}
              maxFiles={maxFiles}
              onFilesSelected={handleFilesSelected}
              onFileRemove={handleFileRemove}
              className="mb-16"
            />
          </div>

          {fileList && fileList.length > 0 && (
            <>
              {FormComponent && (
                <FormComponent onFinish={handleProcess} disabled={processing} />
              )}

              {!FormComponent && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <Button
                    type="primary"
                    onClick={() => handleProcess()}
                    loading={processing}
                    size="large"
                  >
                    {processing ? "Processing..." : title}
                  </Button>
                </div>
              )}

              {showPreview && (
                <>
                  <Title level={3}>Preview:</Title>
                  {previewLoading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <Spin tip="Loading PDF preview..." size="large" />
                    </div>
                  ) : (
                    <PdfPreview
                      files={multipleFiles ? fileList : [fileList[0]]}
                    />
                  )}
                </>
              )}

              {processedFile && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    size="large"
                  >
                    Download Processed PDF
                  </Button>
                </div>
              )}

              {children}
            </>
          )}
        </Space>
      </div>
      <Footer />
    </>
  );
};

export default PdfToolPage;
