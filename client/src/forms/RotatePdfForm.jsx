
import React, { useState } from "react";
import { Form, Button, Radio, message, Alert, Card, Row, Col } from "antd";
import { RotateRightOutlined, InfoCircleOutlined } from "@ant-design/icons";

const RotatePdfForm = ({ onFinish, file }) => {
  const [rotationAngle, setRotationAngle] = useState(1);

  const handleFinish = () => {
    if (!file) {
      message.error("Please upload a PDF file first!");
      return;
    }
    onFinish({ angle: Number(rotationAngle) });
  };

  const getRotationInfo = (angle) => {
    const angleMap = {
      1: {
        degrees: 90,
        direction: "Clockwise",
        description: "Rotate 90° clockwise"
      },
      2: {
        degrees: 180,
        direction: "Clockwise",
        description: "Rotate 180° clockwise"
      },
      3: {
        degrees: 270,
        direction: "Clockwise",
        description: "Rotate 270° clockwise"
      },
      "-1": {
        degrees: 90,
        direction: "Counter-clockwise",
        description: "Rotate 90° counter-clockwise"
      },
      "-2": {
        degrees: 180,
        direction: "Counter-clockwise",
        description: "Rotate 180° counter-clockwise"
      },
      "-3": {
        degrees: 270,
        direction: "Counter-clockwise",
        description: "Rotate 270° counter-clockwise"
      }
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
  { value: -3, label: "270° Counter-clockwise", icon: "↺↺↺" }];


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Form
        name="rotate-pdf"
        layout="vertical"
        style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        
        <Form.Item>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Rotate PDF</div>
        </Form.Item>

        <Form.Item
          label="Rotation Angle"
          rules={[{ required: true, message: "Select rotation angle!" }]}>
          
          <Radio.Group
            value={rotationAngle}
            onChange={(e) => setRotationAngle(e.target.value)}
            style={{ width: "100%" }}>
            
            <Row gutter={[16, 16]}>
              {rotationOptions.map((option) =>
              <Col span={8} key={option.value}>
                  <Card
                  hoverable
                  style={{
                    textAlign: "center",
                    cursor: "pointer",
                    border:
                    rotationAngle === option.value ?
                    "2px solid #1890ff" :
                    "1px solid #d9d9d9",
                    backgroundColor:
                    rotationAngle === option.value ? "#f0f8ff" : "#fff"
                  }}
                  onClick={() => setRotationAngle(option.value)}>
                  
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                      {option.icon}
                    </div>
                    <div style={{ fontSize: "12px", color: "#333" }}>
                      {option.label}
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f6f8fa",
              borderRadius: "8px",
              border: "2px solid #1890ff",
              textAlign: "center"
            }}>
            
            <div
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1890ff",
                marginBottom: "12px"
              }}>
              
              <RotateRightOutlined style={{ marginRight: "8px" }} />
              {currentRotation.description}
            </div>
            <div
              style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
              
              Direction: <strong>{currentRotation.direction}</strong>
            </div>
            <div style={{ fontSize: "12px", color: "#999" }}>
              All pages will be rotated by {currentRotation.degrees}°{" "}
              {currentRotation.direction.toLowerCase()}
            </div>
          </div>
        </Form.Item>
      </Form>

      <Alert
        message="PDF Rotation Instructions"
        description="Choose an angle to rotate all pages of your PDF. Rotation is applied clockwise or counter-clockwise as selected."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }} />
      

      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #f0f0f0",
          background: "#fff",
          position: "sticky",
          bottom: 0,
          zIndex: 10
        }}>
        
        <Button
          type="primary"
          block
          icon={<RotateRightOutlined />}
          size="large"
          disabled={!file}
          onClick={handleFinish}>
          
          Rotate PDF {currentRotation.degrees}°{" "}
          {currentRotation.direction.toLowerCase()}
        </Button>
      </div>
    </div>);

};

export default RotatePdfForm;