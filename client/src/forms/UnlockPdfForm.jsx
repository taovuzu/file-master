// src/components/UnlockPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Input, message } from "antd";
import { UploadOutlined, UnlockOutlined } from "@ant-design/icons";

const UnlockPdfForm = ({ onFinish }) => {
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
      name="unlock-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 500, margin: "0 auto" }}
    >
      <Form.Item
        label="Upload Protected PDF"
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
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please enter the password!" }]}
      >
        <Input.Password
          size="large"
          placeholder="Enter password"
          prefix={<UnlockOutlined />}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<UnlockOutlined />}
          size="large"
        >
          Unlock PDF
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UnlockPdfForm;
