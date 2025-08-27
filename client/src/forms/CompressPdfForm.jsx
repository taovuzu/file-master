import React, { useState } from "react";
import { Form, Button, Select, Alert, Progress, message } from "antd";
import { ShrinkOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const CompressPdfForm = ({ onFinish, file }) => {
  const [compressionLevel, setCompressionLevel] = useState(2);

  const handleFinish = () => {
    if (!file) {
      message.error("Please upload a PDF file first!");
      return;
    }

    onFinish({ level: compressionLevel });
  };

  const getCompressionInfo = (level) => {
    switch (level) {
      case 1:
        return {
          name: "Printer Quality",
          description: "High quality, minimal compression",
          quality: "High",
          size: "Larger file size",
          color: "#52c41a"
        };
      case 2:
        return {
          name: "Ebook Quality",
          description: "Balanced quality and compression",
          quality: "Medium",
          size: "Balanced",
          color: "#1890ff"
        };
      case 3:
        return {
          name: "Screen Quality",
          description: "Maximum compression, lower quality",
          quality: "Lower",
          size: "Smallest file size",
          color: "#fa8c16"
        };
      default:
        return {
          name: "Ebook Quality",
          description: "Balanced quality and compression",
          quality: "Medium",
          size: "Balanced",
          color: "#1890ff"
        };
    }
  };

  const currentInfo = getCompressionInfo(compressionLevel);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}>
      
      <Form
        name="compress-pdf"
        layout="vertical"
        onFinish={handleFinish}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px"
        }}>
        
        <Form.Item
          label="Compression Level"
          name="compressionLevel"
          initialValue={2}
          rules={[{ required: true, message: "Select compression level!" }]}>
          
          <Select
            size="large"
            value={compressionLevel}
            onChange={setCompressionLevel}>
            
            <Option value={1}>
              <ShrinkOutlined style={{ color: "#52c41a" }} /> Printer Quality
              (Minimal)
            </Option>
            <Option value={2}>
              <ShrinkOutlined style={{ color: "#1890ff" }} /> Ebook Quality
              (Balanced)
            </Option>
            <Option value={3}>
              <ShrinkOutlined style={{ color: "#fa8c16" }} /> Screen Quality
              (Maximum)
            </Option>
          </Select>
        </Form.Item>

        {}
        <Form.Item>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f6f8fa",
              borderRadius: "8px",
              border: `2px solid ${currentInfo.color}`,
              borderLeft: `6px solid ${currentInfo.color}`
            }}>
            
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                color: currentInfo.color
              }}>
              
              <ShrinkOutlined style={{ marginRight: "8px" }} />
              {currentInfo.name}
            </div>

            <div style={{ marginBottom: "8px", color: "#333" }}>
              {currentInfo.description}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px"
              }}>
              
              <span>
                <strong>Quality:</strong> {currentInfo.quality}
              </span>
              <span>
                <strong>File Size:</strong> {currentInfo.size}
              </span>
            </div>
          </div>
        </Form.Item>

        {}
        <Form.Item>
          <div style={{ marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "#666" }}>
              Quality vs Size Balance:
            </span>
          </div>
          <Progress
            percent={
            compressionLevel === 1 ? 25 : compressionLevel === 2 ? 50 : 75
            }
            strokeColor={currentInfo.color}
            showInfo={false}
            size="small" />
          
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "#999",
              marginTop: "4px"
            }}>
            
            <span>High Quality</span>
            <span>Balanced</span>
            <span>Small Size</span>
          </div>
        </Form.Item>
      </Form>

      <Alert
        message="PDF Compression Instructions"
        description="Select compression level. Higher compression reduces file size but may affect quality. The compressed file will maintain PDF functionality."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }} />
      

      {}
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
          htmlType="submit"
          block
          icon={<ShrinkOutlined />}
          size="large"
          disabled={!file}
          onClick={handleFinish}>
          
          Compress PDF with {currentInfo.name}
        </Button>
      </div>
    </div>);

};

export default CompressPdfForm;