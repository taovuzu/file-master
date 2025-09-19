
import React, { useState } from "react";
import { Form, Button, Input, message, Alert, Card, Row, Col } from "antd";
import { LockOutlined, InfoCircleOutlined, KeyOutlined } from "@ant-design/icons";

const { Password } = Input;

const UnlockPdfForm = ({ onFinish, file }) => {
  const [password, setPassword] = useState("");

  const handleFinish = () => {
    if (!file) {
      message.error("Please upload a PDF file first!");
      return;
    }
    if (!password || password.trim() === "") {
      message.error("Please enter the PDF password!");
      return;
    }
    onFinish({ password: password });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Form name="unlock-pdf" layout="vertical" onFinish={handleFinish} style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <Form.Item>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Unlock PDF</div>
        </Form.Item>

        <Form.Item label="PDF Password" name="PASSWORD" rules={[{ required: true, message: "Please enter the PDF password!" }]} help="Enter the password that protects this PDF file">
          <Password size="large" placeholder="Enter PDF password" prefix={<KeyOutlined />} maxLength={100} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Item>

        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" style={{ textAlign: 'center', border: '1px solid #d9d9d9', backgroundColor: '#fafafa' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>Protected PDF</strong><br />
                  Password required
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ textAlign: 'center', border: '1px solid #d9d9d9', backgroundColor: '#f6ffed' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>Unlocked PDF</strong><br />
                  No password needed
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Form>

      <Alert message="Unlock PDF Instructions" description="Enter the password for your protected PDF. The password is only used to unlock the file for processing and is not stored." type="info" showIcon icon={<InfoCircleOutlined />} style={{ marginBottom: 24 }} />

      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", background: "#fff", position: "sticky", bottom: 0, zIndex: 10 }}>
        <Button type="primary" htmlType="submit" block icon={<LockOutlined />} size="large" disabled={!file} onClick={handleFinish}>
          Unlock Protected PDF
        </Button>
      </div>
    </div>);

};

export default UnlockPdfForm;