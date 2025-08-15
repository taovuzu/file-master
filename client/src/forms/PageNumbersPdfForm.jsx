// src/components/PageNumbersPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Select, Radio, InputNumber, Switch, message, Alert, Divider, Row, Col, ColorPicker } from "antd";
import { UploadOutlined, FileTextOutlined, InfoCircleOutlined, FontSizeOutlined } from "@ant-design/icons";

const { Option } = Select;

const PageNumbersPdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);
  const [textColor, setTextColor] = useState([0, 0, 0]); // RGB values 0-1

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Keep only the latest uploaded file
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a PDF file first!");
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
      // Convert hex to RGB (0-1 range)
      const hex = textColor.replace('#', '');
      finalColor = [
        parseInt(hex.substr(0, 2), 16) / 255,
        parseInt(hex.substr(2, 2), 16) / 255,
        parseInt(hex.substr(4, 2), 16) / 255
      ];
    }

    onFinish({ 
      file: fileList[0].originFileObj,
      pageMode: values.pageMode || "All Pages",
      firstPageCover: values.firstPageCover || false,
      position: values.position || "bottom-right",
      margin: values.margin || "normal",
      firstNumber: values.firstNumber || 1,
      fromPage: values.fromPage || 1,
      toPage: values.toPage || 1,
      textStyle: values.textStyle || 0,
      fontFamily: values.fontFamily || "Arial",
      fontSize: values.fontSize || "normal",
      textColor: finalColor
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

  const getTextStylePreview = (style, firstNumber) => {
    const styles = [
      `${firstNumber}`,
      `Page ${firstNumber}`,
      `Page ${firstNumber} of N`
    ];
    return styles[style] || styles[0];
  };

  return (
    <Form
      name="page-numbers-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 700, margin: "0 auto" }}
      initialValues={{
        pageMode: "All Pages",
        firstPageCover: false,
        position: "bottom-right",
        margin: "normal",
        firstNumber: 1,
        fromPage: 1,
        toPage: 1,
        textStyle: 0,
        fontFamily: "Arial",
        fontSize: "normal"
      }}
    >
      <Alert
        message="Add Page Numbers Instructions"
        description="Upload a PDF file and configure page number settings. You can customize the position, style, font, and page range for adding page numbers."
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

      <Divider orientation="left">Page Range Settings</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Page Mode"
            name="pageMode"
          >
            <Radio.Group>
              <Radio.Button value="All Pages">All Pages</Radio.Button>
              <Radio.Button value="Facing Pages">Facing Pages</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="First Page is Cover"
            name="firstPageCover"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="From Page"
            name="fromPage"
            rules={[{ required: true, message: "Enter start page!" }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="To Page"
            name="toPage"
            rules={[{ required: true, message: "Enter end page!" }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="First Number"
            name="firstNumber"
            rules={[{ required: true, message: "Enter first number!" }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Page Number Style</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Position"
            name="position"
          >
            <Select>
              <Option value="top-left">Top Left</Option>
              <Option value="top-right">Top Right</Option>
              <Option value="bottom-left">Bottom Left</Option>
              <Option value="bottom-right">Bottom Right</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Margin"
            name="margin"
          >
            <Select>
              <Option value="small">Small</Option>
              <Option value="normal">Normal</Option>
              <Option value="large">Large</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Text Style"
            name="textStyle"
          >
            <Select>
              <Option value={0}>Just Number (1)</Option>
              <Option value={1}>Page Number (Page 1)</Option>
              <Option value={2}>Page X of Y (Page 1 of N)</Option>
            </Select>
          </Form.Item>
        </Col>
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
      </Row>

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
                '#000000', // Black
                '#FFFFFF', // White
                '#FF0000', // Red
                '#0000FF', // Blue
                '#008000', // Green
                '#800080', // Purple
                '#FFA500', // Orange
                '#808080', // Gray
              ],
            },
          ]}
        />
      </Form.Item>

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
            Page Number Preview
          </div>
          
          <div style={{ 
            fontSize: '14px', 
            color: '#333',
            marginBottom: '8px'
          }}>
            Style: <strong>{getTextStylePreview(0, 1)}</strong>
          </div>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#666'
          }}>
            Position: <strong>Bottom Right</strong> • Font: <strong>Arial</strong> • Size: <strong>Normal</strong>
          </div>
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<FileTextOutlined />}
          size="large"
          disabled={fileList.length === 0}
        >
          Add Page Numbers to PDF
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PageNumbersPdfForm;
