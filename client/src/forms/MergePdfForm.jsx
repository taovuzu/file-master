// src/components/MergePdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, message } from "antd";
import { UploadOutlined, MergeCellsOutlined } from "@ant-design/icons";

const MergePdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleFinish = () => {
    if (fileList.length < 2) {
      message.error("Please upload at least two PDF files to merge!");
      return;
    }
    // Pass all uploaded files to the parent handler
    onFinish({ files: fileList.map((file) => file.originFileObj) });
  };

  return (
    <Form
      name="merge-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 500, margin: "0 auto" }}
    >
      <Form.Item
        label="Upload PDFs"
        rules={[{ required: true, message: "Please upload PDF files!" }]}
      >
        <Upload
          accept="application/pdf"
          multiple
          beforeUpload={() => false} // Prevent auto-upload
          onChange={handleUploadChange}
          fileList={fileList}
        >
          <Button icon={<UploadOutlined />} size="large">
            Select PDFs
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<MergeCellsOutlined />}
          size="large"
        >
          Merge PDFs
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MergePdfForm;
