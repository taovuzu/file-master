// src/components/ProtectPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Input, message, Alert, Card, Row, Col, Divider } from "antd";
import { UploadOutlined, LockOutlined, InfoCircleOutlined, KeyOutlined, SecurityScanOutlined } from "@ant-design/icons";

const { Password } = Input;

const ProtectPdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Keep only the latest uploaded file
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a PDF file first!");
      return;
    }

    if (!values.PASSWORD || values.PASSWORD.trim() === "") {
      message.error("Please enter a password!");
      return;
    }

    if (values.PASSWORD !== confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    if (values.PASSWORD.length < 6) {
      message.error("Password must be at least 6 characters long!");
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

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    
    if (value.length < 6) {
      return Promise.reject(new Error('Password must be at least 6 characters long'));
    }
    
    if (value.length > 50) {
      return Promise.reject(new Error('Password must be less than 50 characters'));
    }
    
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    
    if (value !== confirmPassword) {
      return Promise.reject(new Error('Passwords do not match'));
    }
    
    return Promise.resolve();
  };

  return (
    <Form
      name="protect-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Alert
        message="Protect PDF Instructions"
        description="Upload a PDF file and set a password to protect it. The protected PDF will require the password to open, view, or edit. All content and formatting will be preserved."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        label="Upload PDF"
        rules={[{ required: true, message: "Please upload a PDF file!" }]}
      >
        <Upload
          accept="application/pdf"
          beforeUpload={beforeUpload}
          onChange={handleUploadChange}
          fileList={fileList}
        >
          <Button icon={<UploadOutlined />} size="large">
            Select PDF to Protect
          </Button>
        </Upload>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          • Only PDF files accepted • Maximum file size: 10MB<br/>
          • Will be protected using Ghostscript encryption
        </div>
      </Form.Item>

      <Divider orientation="left">Password Protection</Divider>

      <Form.Item
        label="Set Password"
        name="PASSWORD"
        rules={[
          { required: true, message: "Please enter a password!" },
          { validator: validatePassword }
        ]}
        help="Password must be at least 6 characters long"
      >
        <Password
          size="large"
          placeholder="Enter password to protect PDF"
          prefix={<KeyOutlined />}
          maxLength={50}
          onChange={(e) => setConfirmPassword("")} // Clear confirm when password changes
        />
      </Form.Item>

      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        rules={[
          { required: true, message: "Please confirm your password!" },
          { validator: validateConfirmPassword }
        ]}
        help="Re-enter the password to confirm"
      >
        <Password
          size="large"
          placeholder="Confirm password"
          prefix={<KeyOutlined />}
          maxLength={50}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </Form.Item>

      {/* Password Strength Indicator */}
      <Form.Item>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f6f8fa', 
          borderRadius: '8px',
          border: '1px solid #e1e4e8'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '12px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            <SecurityScanOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Password Requirements
          </div>
          
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#586069' }}>
            <li>Minimum 6 characters long</li>
            <li>Maximum 50 characters</li>
            <li>Use strong, unique passwords</li>
            <li>Consider using letters, numbers, and symbols</li>
          </ul>
        </div>
      </Form.Item>

      {/* Protection Information Cards */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={16}>
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
                <strong>Original PDF</strong><br/>
                No protection
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card
              size="small"
              style={{ 
                textAlign: 'center',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fff2e8'
              }}
            >
              <LockOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', color: '#666' }}>
                <strong>Protected PDF</strong><br/>
                Password required
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Security Note */}
      <Alert
        message="Security Information"
        description="The password you set will be used to encrypt the PDF. Keep this password safe - it cannot be recovered if lost. The protected PDF will be processed securely using Ghostscript encryption."
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
          Protect PDF with Password
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
          <strong>What happens when you protect a PDF:</strong>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>The PDF is encrypted with your password</li>
          <li>All content and formatting is preserved</li>
          <li>The file requires the password to open</li>
          <li>Protection is applied using secure Ghostscript technology</li>
          <li>Both owner and user passwords are set to the same value</li>
        </ul>
      </div>
    </Form>
  );
};

export default ProtectPdfForm;
