// src/components/CompressPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Select, message } from "antd";
import { UploadOutlined, ShrinkOutlined } from "@ant-design/icons";

const { Option } = Select;

const CompressPdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Only keep the latest uploaded file
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a PDF file first!");
      return;
    }
    // Pass file and compression level to parent handler
    onFinish({ ...values, file: fileList[0].originFileObj });
  };

  return (
    <Form
      name="compress-pdf"
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
          beforeUpload={() => false} // Prevent auto upload
          onChange={handleUploadChange}
          fileList={fileList}
        >
          <Button icon={<UploadOutlined />} size="large">
            Select PDF
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item
        label="Compression Level"
        name="level"
        initialValue="medium"
        rules={[{ required: true, message: "Select compression level!" }]}
      >
        <Select size="large">
          <Option value="low">Low (minimal compression)</Option>
          <Option value="medium">Medium (balanced)</Option>
          <Option value="high">High (maximum compression)</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<ShrinkOutlined />}
          size="large"
        >
          Compress PDF
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CompressPdfForm;
