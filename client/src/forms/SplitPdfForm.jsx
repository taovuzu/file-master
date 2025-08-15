// src/components/SplitPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Input, message, Alert, Divider, Space } from "antd";
import { UploadOutlined, PartitionOutlined, InfoCircleOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const SplitPdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);
  const [ranges, setRanges] = useState([{ start: 1, end: 1 }]);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // Keep only the latest uploaded file
  };

  const addRange = () => {
    setRanges([...ranges, { start: 1, end: 1 }]);
  };

  const removeRange = (index) => {
    if (ranges.length > 1) {
      const newRanges = ranges.filter((_, i) => i !== index);
      setRanges(newRanges);
    }
  };

  const updateRange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index][field] = parseInt(value) || 1;
    setRanges(newRanges);
  };

  const validateRanges = () => {
    for (let i = 0; i < ranges.length; i++) {
      const { start, end } = ranges[i];
      if (start < 1 || end < 1) {
        message.error(`Range ${i + 1}: Start and end pages must be at least 1`);
        return false;
      }
      if (start > end) {
        message.error(`Range ${i + 1}: Start page cannot be greater than end page`);
        return false;
      }
    }
    return true;
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a PDF file!");
      return;
    }

    if (!validateRanges()) {
      return;
    }

    // Convert ranges to the format expected by server: [[start, end], [start, end], ...]
    const rangesArray = ranges.map(range => [range.start, range.end]);

    onFinish({ 
      file: fileList[0].originFileObj,
      ranges: rangesArray
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
      name="split-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Alert
        message="PDF Split Instructions"
        description="Upload a PDF file and specify page ranges to split. Each range will create a separate PDF file. The result will be downloaded as a ZIP file containing all split PDFs."
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

      <Divider orientation="left">Page Ranges</Divider>

      <Form.Item
        label="Define Page Ranges"
        help="Specify which pages to extract. Each range will create a separate PDF file."
      >
        {ranges.map((range, index) => (
          <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <span style={{ minWidth: '60px' }}>Range {index + 1}:</span>
            <Input
              type="number"
              min={1}
              placeholder="Start"
              value={range.start}
              onChange={(e) => updateRange(index, 'start', e.target.value)}
              style={{ width: '80px' }}
            />
            <span>to</span>
            <Input
              type="number"
              min={1}
              placeholder="End"
              value={range.end}
              onChange={(e) => updateRange(index, 'end', e.target.value)}
              style={{ width: '80px' }}
            />
            {ranges.length > 1 && (
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => removeRange(index)}
                size="small"
              />
            )}
          </Space>
        ))}
        
        <Button
          type="dashed"
          onClick={addRange}
          icon={<PlusOutlined />}
          style={{ marginTop: 8 }}
        >
          Add Another Range
        </Button>
      </Form.Item>

      {ranges.length > 0 && (
        <Form.Item>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f6f8fa', 
            borderRadius: '6px',
            border: '1px solid #e1e4e8'
          }}>
            <strong>Ranges to extract ({ranges.length}):</strong>
            <div style={{ marginTop: '8px', fontSize: '13px' }}>
              {ranges.map((range, index) => (
                <div key={index} style={{ marginBottom: '4px', color: '#586069' }}>
                  Range {index + 1}: Pages {range.start} - {range.end}
                </div>
              ))}
            </div>
          </div>
        </Form.Item>
      )}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<PartitionOutlined />}
          size="large"
          disabled={fileList.length === 0 || ranges.length === 0}
        >
          Split PDF into {ranges.length} File{ranges.length !== 1 ? 's' : ''}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SplitPdfForm;
