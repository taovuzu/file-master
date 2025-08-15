// src/components/ConvertPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Select, message } from "antd";
import { UploadOutlined, FilePdfOutlined } from "@ant-design/icons";

const { Option } = Select;

const ConvertPdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Only keep latest file
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a PDF file first!");
      return;
    }
    onFinish({ ...values, file: fileList[0].originFileObj });
  };

  return (
    <Form
      name="convert-pdf"
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
        label="Convert To"
        name="format"
        rules={[{ required: true, message: "Please select target format!" }]}
        initialValue="word"
      >
        <Select size="large">
          <Option value="word">Word (.docx)</Option>
          <Option value="excel">Excel (.xlsx)</Option>
          <Option value="image">Image (.jpg/.png)</Option>
          <Option value="ppt">PowerPoint (.pptx)</Option>
          <Option value="txt">Text (.txt)</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<FilePdfOutlined />}
          size="large"
        >
          Convert PDF
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ConvertPdfForm;
