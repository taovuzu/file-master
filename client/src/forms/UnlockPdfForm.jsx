// src/components/UnlockPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Input, message, Alert, Card, Row, Col } from "antd";
import { UploadOutlined, LockOutlined, InfoCircleOutlined, KeyOutlined } from "@ant-design/icons";

const { Password } = Input;

const UnlockPdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Keep only the latest uploaded file
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a PDF file first!");
      return;
    }

    if (!values.PASSWORD || values.PASSWORD.trim() === "") {
      message.error("Please enter the PDF password!");
      return;
    }

    // Pass file and password to parent handler with proper field name
    onFinish({ 
      file: fileList[0].originFileObj,
      PASSWORD: values.PASSWORD
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
      name="unlock-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Alert
        message="Unlock PDF Instructions"
        description="Upload a password-protected PDF file and enter the password to unlock it. The unlocked PDF will maintain all its original content and formatting."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        label="Upload Protected PDF"
        rules={[{ required: true, message: "Please upload a PDF file!" }]}
      >
        <Upload
          accept="application/pdf"
          beforeUpload={beforeUpload}
          onChange={handleUploadChange}
          fileList={fileList}
        >
          <Button icon={<UploadOutlined />} size="large">
            Select Protected PDF
          </Button>
        </Upload>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          • Only PDF files accepted • Maximum file size: 10MB<br/>
          • Must be password-protected • Will be unlocked using Ghostscript
        </div>
      </Form.Item>

      <Form.Item
        label="PDF Password"
        name="PASSWORD"
        rules={[{ required: true, message: "Please enter the PDF password!" }]}
        help="Enter the password that protects this PDF file"
      >
        <Password
          size="large"
          placeholder="Enter PDF password"
          prefix={<KeyOutlined />}
          maxLength={100}
        />
      </Form.Item>

      {/* Information Cards */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card
              size="small"
              style={{ 
                textAlign: 'center',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fafafa'
              }}
            >
              <LockOutlined style={{ fontSize: '24px', color: '#ff4d4f', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', color: '#666' }}>
                <strong>Protected PDF</strong><br/>
                Password required
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              size="small"
              style={{ 
                textAlign: 'center',
                border: '1px solid #d9d9d9',
                backgroundColor: '#f6ffed'
              }}
            >
              <UploadOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', color: '#666' }}>
                <strong>Unlocked PDF</strong><br/>
                No password needed
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Security Note */}
      <Alert
        message="Security Information"
        description="The password you enter is only used to unlock the PDF and is not stored or transmitted to our servers. The unlocked PDF will be processed securely and deleted after processing."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<LockOutlined />}
          size="large"
          disabled={fileList.length === 0}
        >
          Unlock Protected PDF
        </Button>
      </Form.Item>

      {/* Additional Information */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f6f8fa', 
        borderRadius: '8px',
        border: '1px solid #e1e4e8',
        fontSize: '12px',
        color: '#586069'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>What happens when you unlock a PDF:</strong>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>The password protection is removed</li>
          <li>All content and formatting is preserved</li>
          <li>The file becomes accessible without a password</li>
          <li>Processing is done using secure Ghostscript technology</li>
        </ul>
      </div>
    </Form>
  );
};

export default UnlockPdfForm;
