// src/components/MergePdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, message, Alert } from "antd";
import { UploadOutlined, MergeCellsOutlined, InfoCircleOutlined } from "@ant-design/icons";

const MergePdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList }) => {
    // Limit to 15 files as per server requirement
    if (fileList.length > 15) {
      message.warning("Maximum 15 PDF files allowed. Only the first 15 will be used.");
      setFileList(fileList.slice(0, 15));
    } else {
      setFileList(fileList);
    }
  };

  const handleFinish = () => {
    if (fileList.length < 2) {
      message.error("Please upload at least two PDF files to merge!");
      return;
    }

    if (fileList.length > 15) {
      message.error("Maximum 15 PDF files allowed!");
      return;
    }

    // Pass all uploaded files to the parent handler with proper field name
    onFinish({ 
      PDFFILES: fileList.map((file) => file.originFileObj),
      fileCount: fileList.length
    });
  };

  const beforeUpload = (file) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('You can only upload PDF files!');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return false;
    }
    
    return false; // Prevent auto-upload
  };

  return (
    <Form
      name="merge-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Alert
        message="PDF Merge Instructions"
        description="Upload 2-15 PDF files to merge them into a single document. Files will be merged in the order they are uploaded."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        label="Upload PDFs"
        rules={[{ required: true, message: "Please upload PDF files!" }]}
        help={`${fileList.length}/15 files selected`}
      >
        <Upload
          accept="application/pdf"
          multiple
          beforeUpload={beforeUpload}
          onChange={handleUploadChange}
          fileList={fileList}
          maxCount={15}
        >
          <Button icon={<UploadOutlined />} size="large">
            Select PDFs (Max 15)
          </Button>
        </Upload>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          • Minimum 2 files required • Maximum 15 files allowed<br/>
          • Only PDF files accepted • Maximum file size: 10MB
        </div>
      </Form.Item>

      {fileList.length > 0 && (
        <Form.Item>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f6f8fa', 
            borderRadius: '6px',
            border: '1px solid #e1e4e8'
          }}>
            <strong>Files to merge ({fileList.length}):</strong>
            <div style={{ marginTop: '8px', fontSize: '13px' }}>
              {fileList.map((file, index) => (
                <div key={file.uid} style={{ marginBottom: '4px', color: '#586069' }}>
                  {index + 1}. {file.name}
                </div>
              ))}
            </div>
          </div>
        </Form.Item>
      )}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<MergeCellsOutlined />}
          size="large"
          disabled={fileList.length < 2}
        >
          Merge {fileList.length > 0 ? `${fileList.length}` : ''} PDF{fileList.length !== 1 ? 's' : ''}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MergePdfForm;
