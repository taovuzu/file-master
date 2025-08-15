// src/components/RotatePdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Radio, message, Alert, Card, Row, Col } from "antd";
import { UploadOutlined, RotateRightOutlined, InfoCircleOutlined } from "@ant-design/icons";

const RotatePdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);
  const [rotationAngle, setRotationAngle] = useState(1);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Keep only the latest uploaded file
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a PDF file first!");
      return;
    }

    // Pass file and rotation angle to parent handler with proper field name
    onFinish({ 
      file: fileList[0].originFileObj,
      angle: rotationAngle
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

  const getRotationInfo = (angle) => {
    const angleMap = {
      1: { degrees: 90, direction: "Clockwise", description: "Rotate 90° clockwise" },
      2: { degrees: 180, direction: "Clockwise", description: "Rotate 180° clockwise" },
      3: { degrees: 270, direction: "Clockwise", description: "Rotate 270° clockwise" },
      "-1": { degrees: 90, direction: "Counter-clockwise", description: "Rotate 90° counter-clockwise" },
      "-2": { degrees: 180, direction: "Counter-clockwise", description: "Rotate 180° counter-clockwise" },
      "-3": { degrees: 270, direction: "Counter-clockwise", description: "Rotate 270° counter-clockwise" }
    };
    return angleMap[angle] || angleMap[1];
  };

  const currentRotation = getRotationInfo(rotationAngle);

  const rotationOptions = [
    { value: 1, label: "90° Clockwise", icon: "↻" },
    { value: 2, label: "180° Clockwise", icon: "↻↻" },
    { value: 3, label: "270° Clockwise", icon: "↻↻↻" },
    { value: -1, label: "90° Counter-clockwise", icon: "↺" },
    { value: -2, label: "180° Counter-clockwise", icon: "↺↺" },
    { value: -3, label: "270° Counter-clockwise", icon: "↺↺↺" }
  ];

  return (
    <Form
      name="rotate-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 700, margin: "0 auto" }}
    >
      <Alert
        message="PDF Rotation Instructions"
        description="Upload a PDF file and select the rotation angle. All pages in the PDF will be rotated by the specified amount. The rotation is applied clockwise or counter-clockwise as indicated."
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
            Select PDF
          </Button>
        </Upload>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          • Only PDF files accepted • Maximum file size: 10MB
        </div>
      </Form.Item>

      <Form.Item
        label="Rotation Angle"
        name="angle"
        initialValue={1}
        rules={[{ required: true, message: "Select rotation angle!" }]}
      >
        <Radio.Group 
          value={rotationAngle} 
          onChange={(e) => setRotationAngle(e.target.value)}
          style={{ width: '100%' }}
        >
          <Row gutter={[16, 16]}>
            {rotationOptions.map(option => (
              <Col span={8} key={option.value}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: rotationAngle === option.value ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    backgroundColor: rotationAngle === option.value ? '#f0f8ff' : '#fff'
                  }}
                  onClick={() => setRotationAngle(option.value)}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {option.icon}
                  </div>
                  <div style={{ fontSize: '12px', color: '#333' }}>
                    {option.label}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Radio.Group>
      </Form.Item>

      {/* Rotation Preview */}
      <Form.Item>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f6f8fa', 
          borderRadius: '8px',
          border: '2px solid #1890ff',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#1890ff',
            marginBottom: '12px'
          }}>
            <RotateRightOutlined style={{ marginRight: '8px' }} />
            {currentRotation.description}
          </div>
          
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            marginBottom: '8px'
          }}>
            Direction: <strong>{currentRotation.direction}</strong>
          </div>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#999'
          }}>
            All pages will be rotated by {currentRotation.degrees}° {currentRotation.direction.toLowerCase()}
          </div>
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<RotateRightOutlined />}
          size="large"
          disabled={fileList.length === 0}
        >
          Rotate PDF {currentRotation.degrees}° {currentRotation.direction.toLowerCase()}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RotatePdfForm;
