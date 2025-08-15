// src/components/SplitPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Input, message } from "antd";
import { UploadOutlined, PartitionOutlined } from "@ant-design/icons";

const SplitPdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Keep only the latest uploaded file
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a PDF file!");
      return;
    }
    onFinish({ ...values, file: fileList[0].originFileObj });
  };

  return (
    <Form
      name="split-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 500, margin: "0 auto" }}
    >
      <Form.Item
        label="Upload PDF"
        rules={[{ required: true, message: "Please upload a PDF file!" }]}
      >
        <Upload
          accept="application/pdf"
          beforeUpload={() => false} // Prevent auto-upload
          onChange={handleUploadChange}
          fileList={fileList}
        >
          <Button icon={<UploadOutlined />} size="large">
            Select PDF
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item
        label="Page Range (e.g., 1-3,5,7-9)"
        name="pageRanges"
        rules={[{ required: true, message: "Please enter page ranges!" }]}
      >
        <Input
          size="large"
          placeholder="Enter pages to split (e.g., 1-3,5)"
          prefix={<PartitionOutlined />}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<PartitionOutlined />}
          size="large"
        >
          Split PDF
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SplitPdfForm;
