// src/components/WatermarkPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Select, Radio, InputNumber, Switch, message, Alert, Divider, Row, Col, ColorPicker, Input, Slider } from "antd";
import { UploadOutlined, FileTextOutlined, FileImageOutlined, InfoCircleOutlined, FontSizeOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const WatermarkPdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);
  const [watermarkType, setWatermarkType] = useState("text");
  const [textColor, setTextColor] = useState([0, 0, 0]); // RGB values 0-1
  const [imageFileList, setImageFileList] = useState([]);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Keep only the latest uploaded file
  };

  const handleImageUploadChange = ({ fileList }) => {
    setImageFileList(fileList.slice(-1)); // Keep only the latest uploaded image
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a PDF file first!");
      return;
    }

    if (watermarkType === "image" && imageFileList.length === 0) {
      message.error("Please upload a watermark image!");
      return;
    }

    // Validate page ranges
    if (values.fromPage > values.toPage) {
      message.error("From page cannot be greater than To page!");
      return;
    }

    // Convert color to RGB array if it's a hex string
    let finalColor = textColor;
    if (typeof textColor === 'string') {
      const hex = textColor.replace('#', '');
      finalColor = [
        parseInt(hex.substr(0, 2), 16) / 255,
        parseInt(hex.substr(2, 2), 16) / 255,
        parseInt(hex.substr(4, 2), 16) / 255
      ];
    }

    const formData = {
      file: fileList[0].originFileObj,
      watermarkType,
      fromPage: values.fromPage || 1,
      toPage: values.toPage || 1,
      position: values.position || "bottom-right",
      transparency: values.transparency || 0.5,
      rotation: values.rotation || 0,
      layer: values.layer || "overlay"
    };

    if (watermarkType === "text") {
      formData.text = values.text || "WATERMARK";
      formData.fontFamily = values.fontFamily || "Arial";
      formData.fontSize = values.fontSize || "normal";
      formData.textColor = finalColor;
    } else if (watermarkType === "image") {
      formData.watermarkImage = imageFileList[0].originFileObj;
      formData.scale = values.scale || 0.25;
    }

    onFinish(formData);
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

  const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }
    
    return false; // Prevent auto-upload
  };

  const getPositionOptions = () => [
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "center", label: "Center" },
    { value: "top-center", label: "Top Center" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "left-center", label: "Left Center" },
    { value: "right-center", label: "Right Center" },
    { value: "mosaic", label: "Mosaic (Repeated)" }
  ];

  return (
    <Form
      name="watermark-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 700, margin: "0 auto" }}
      initialValues={{
        fromPage: 1,
        toPage: 1,
        position: "bottom-right",
        transparency: 0.5,
        rotation: 0,
        layer: "overlay",
        text: "WATERMARK",
        fontFamily: "Arial",
        fontSize: "normal",
        scale: 0.25
      }}
    >
      <Alert
        message="Add Watermark Instructions"
        description="Upload a PDF file and add either text or image watermarks. You can customize the position, transparency, rotation, and page range for the watermark."
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

      <Divider orientation="left">Watermark Type</Divider>

      <Form.Item
        label="Watermark Type"
        name="watermarkType"
        initialValue="text"
      >
        <Radio.Group onChange={(e) => setWatermarkType(e.target.value)} value={watermarkType}>
          <Radio.Button value="text">
            <FileTextOutlined /> Text Watermark
          </Radio.Button>
          <Radio.Button value="image">
            <FileImageOutlined /> Image Watermark
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      {watermarkType === "text" && (
        <>
          <Divider orientation="left">Text Watermark Settings</Divider>
          
          <Form.Item
            label="Watermark Text"
            name="text"
            rules={[{ required: true, message: "Enter watermark text!" }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Enter your watermark text here..."
              maxLength={100}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Font Family"
                name="fontFamily"
              >
                <Select>
                  <Option value="Arial">Arial</Option>
                  <Option value="Times New Roman">Times New Roman</Option>
                  <Option value="Courier">Courier</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Font Size"
                name="fontSize"
              >
                <Select>
                  <Option value="small">Small</Option>
                  <Option value="normal">Normal</Option>
                  <Option value="large">Large</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Text Color"
                name="textColor"
              >
                <ColorPicker
                  value={textColor}
                  onChange={setTextColor}
                  showText
                  presets={[
                    {
                      label: 'Recommended',
                      colors: [
                        '#000000', '#FFFFFF', '#FF0000', '#0000FF',
                        '#008000', '#800080', '#FFA500', '#808080',
                      ],
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {watermarkType === "image" && (
        <>
          <Divider orientation="left">Image Watermark Settings</Divider>
          
          <Form.Item
            label="Upload Watermark Image"
            name="watermarkImage"
            rules={[{ required: true, message: "Please upload a watermark image!" }]}
          >
            <Upload
              accept="image/*"
              beforeUpload={beforeImageUpload}
              onChange={handleImageUploadChange}
              fileList={imageFileList}
            >
              <Button icon={<FileImageOutlined />} size="large">
                Select Image
              </Button>
            </Upload>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              • Supported: JPG, JPEG, PNG, GIF, BMP, TIFF, SVG, WEBP, HEIC<br/>
              • Maximum file size: 5MB
            </div>
          </Form.Item>

          <Form.Item
            label="Image Scale"
            name="scale"
            help="Scale factor for the watermark image (0.1 = 10%, 1.0 = 100%)"
          >
            <Slider
              min={0.1}
              max={1.0}
              step={0.05}
              marks={{
                0.1: '10%',
                0.25: '25%',
                0.5: '50%',
                0.75: '75%',
                1.0: '100%'
              }}
            />
          </Form.Item>
        </>
      )}

      <Divider orientation="left">Watermark Properties</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="From Page"
            name="fromPage"
            rules={[{ required: true, message: "Enter start page!" }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="To Page"
            name="toPage"
            rules={[{ required: true, message: "Enter end page!" }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Position"
            name="position"
          >
            <Select>
              {getPositionOptions().map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Layer"
            name="layer"
          >
            <Select>
              <Option value="overlay">Overlay (Above content)</Option>
              <Option value="background">Background (Behind content)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Transparency"
            name="transparency"
            help="0 = Fully transparent, 1 = Fully opaque"
          >
            <Slider
              min={0}
              max={1}
              step={0.1}
              marks={{
                0: '0%',
                0.5: '50%',
                1: '100%'
              }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Rotation (degrees)"
            name="rotation"
            help="Rotation angle in degrees"
          >
            <InputNumber
              min={0}
              max={360}
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Preview Section */}
      <Form.Item>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f6f8fa', 
          borderRadius: '8px',
          border: '2px solid #1890ff',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#1890ff',
            marginBottom: '16px'
          }}>
            <FontSizeOutlined style={{ marginRight: '8px' }} />
            Watermark Preview
          </div>
          
          <div style={{ 
            fontSize: '14px', 
            color: '#333',
            marginBottom: '8px'
          }}>
            Type: <strong>{watermarkType === 'text' ? 'Text' : 'Image'}</strong> • Position: <strong>Bottom Right</strong>
          </div>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#666'
          }}>
            Transparency: <strong>50%</strong> • Rotation: <strong>0°</strong> • Layer: <strong>Overlay</strong>
          </div>
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={watermarkType === 'text' ? <FileTextOutlined /> : <FileImageOutlined />}
          size="large"
          disabled={fileList.length === 0 || (watermarkType === 'image' && imageFileList.length === 0)}
        >
          Add {watermarkType === 'text' ? 'Text' : 'Image'} Watermark to PDF
        </Button>
      </Form.Item>
    </Form>
  );
};

export default WatermarkPdfForm;
