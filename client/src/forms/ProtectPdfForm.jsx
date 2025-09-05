
import React, { useState } from "react";
import { Form, Button, Input, message, Alert, Card, Row, Col, Divider } from "antd";
import { LockOutlined, InfoCircleOutlined, KeyOutlined, SecurityScanOutlined } from "@ant-design/icons";

const { Password } = Input;

const ProtectPdfForm = ({ onFinish, file }) => {
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFinish = (values) => {
    if (!file) {
      message.error("Please upload a PDF file first!");
      return;
    }

    if (!confirmPassword || confirmPassword.trim() === "") {
      message.error("Please enter a password!");
      return;
    }

    if (confirmPassword.length < 6) {
      message.error("Password must be at least 6 characters long!");
      return;
    }

    onFinish({ password: confirmPassword });
  };

  const validatePassword = (_, value) => {
    if (!value) return Promise.resolve();
    if (value.length < 6) return Promise.reject(new Error('Password must be at least 6 characters long'));
    if (value.length > 50) return Promise.reject(new Error('Password must be less than 50 characters'));
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value) return Promise.resolve();
    if (value !== confirmPassword) return Promise.reject(new Error('Passwords do not match'));
    return Promise.resolve();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Form name="protect-pdf" layout="vertical" onFinish={handleFinish} style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <Form.Item>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Protect PDF</div>
        </Form.Item>

        <Divider orientation="left">Password Protection</Divider>

        <Form.Item label="Set Password" name="PASSWORD" rules={[{ required: true, message: "Please enter a password!" }, { validator: validatePassword }]} help="Password must be at least 6 characters long">
          <Password size="large" placeholder="Enter password to protect PDF" prefix={<KeyOutlined />} maxLength={50} onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
        </Form.Item>

        <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, message: "Please confirm your password!" }, { validator: validateConfirmPassword }]} help="Re-enter the password to confirm">
          <Password size="large" placeholder="Confirm password" prefix={<KeyOutlined />} maxLength={50} />
        </Form.Item>

        {}
        <Form.Item>
          <div style={{ padding: '16px', backgroundColor: '#f6f8fa', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
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

        {}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" style={{ textAlign: 'center', border: '1px solid #d9d9d9', backgroundColor: '#f6ffed' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>Original PDF</strong><br />
                  No protection
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ textAlign: 'center', border: '1px solid #d9d9d9', backgroundColor: '#fff2e8' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>Protected PDF</strong><br />
                  Password required
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Form>

      <Alert message="Security Information" description="The password you set will be used to encrypt the PDF. Keep this password safe - it cannot be recovered if lost. The protected PDF will be processed securely using Ghostscript encryption." type="warning" showIcon icon={<InfoCircleOutlined />} style={{ marginBottom: 24 }} />

      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", background: "#fff", position: "sticky", bottom: 0, zIndex: 10 }}>
        <Button type="primary" htmlType="submit" block icon={<LockOutlined />} size="large" disabled={!file} onClick={handleFinish}>
          Protect PDF with Password
        </Button>
      </div>
    </div>);

};

export default ProtectPdfForm;