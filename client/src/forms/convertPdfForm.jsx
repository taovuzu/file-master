// src/components/ConvertPdfForm.jsx
import React, { useState } from "react";
import { Form, Button, Upload, Select, Radio, InputNumber, Switch, message } from "antd";
import { UploadOutlined, FilePdfOutlined, FileImageOutlined, FileTextOutlined } from "@ant-design/icons";

const { Option } = Select;

const ConvertPdfForm = ({ onFinish }) => {
  const [fileList, setFileList] = useState([]);
  const [conversionType, setConversionType] = useState("doc-to-pdf");
  const [isMultipleImages, setIsMultipleImages] = useState(true);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); 
  };

  const handleMultipleImagesChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a file first!");
      return;
    }

    if (conversionType === "image-to-pdf" && fileList.length < 1) {
      message.error("Please upload at least one image file!");
      return;
    }

    if (conversionType === "doc-to-pdf" && fileList.length !== 1) {
      message.error("Please upload exactly one document file!");
      return;
    }

    if (conversionType === "pdf-to-pptx" && fileList.length !== 1) {
      message.error("Please upload exactly one PDF file!");
      return;
    }

    const formData = {
      ...values,
      conversionType,
      files: fileList.map(file => file.originFileObj)
    };

    onFinish(formData);
  };

  const renderUploadField = () => {
    switch (conversionType) {
      case "doc-to-pdf":
        return (
          <Form.Item
            label="Upload Document"
            rules={[{ required: true, message: "Please upload a document file!" }]}
          >
            <Upload
              accept=".doc,.docx,.odt,.txt,.rtf,.csv,.html,.xml,.epub,.xlsx,.xls,.ods,.pptx,.ppt,.odp"
              beforeUpload={() => false}
              onChange={handleUploadChange}
              fileList={fileList}
            >
              <Button icon={<UploadOutlined />} size="large">
                Select Document
              </Button>
            </Upload>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Supported: DOC, DOCX, ODT, TXT, RTF, CSV, HTML, XML, EPUB, XLSX, XLS, ODS, PPTX, PPT, ODP
            </div>
          </Form.Item>
        );

      case "image-to-pdf":
        return (
          <Form.Item
            label="Upload Images"
            rules={[{ required: true, message: "Please upload image files!" }]}
          >
            <Upload
              accept=".jpg,.jpeg,.png,.gif,.bmp,.tiff,.svg,.webp,.heic"
              multiple
              beforeUpload={() => false}
              onChange={handleMultipleImagesChange}
              fileList={fileList}
            >
              <Button icon={<FileImageOutlined />} size="large">
                Select Images
              </Button>
            </Upload>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Supported: JPG, JPEG, PNG, GIF, BMP, TIFF, SVG, WEBP, HEIC
            </div>
          </Form.Item>
        );

      case "pdf-to-pptx":
        return (
          <Form.Item
            label="Upload PDF"
            rules={[{ required: true, message: "Please upload a PDF file!" }]}
          >
            <Upload
              accept="application/pdf"
              beforeUpload={() => false}
              onChange={handleUploadChange}
              fileList={fileList}
            >
              <Button icon={<FilePdfOutlined />} size="large">
                Select PDF
              </Button>
            </Upload>
          </Form.Item>
        );

      default:
        return null;
    }
  };

  const renderImageToPdfOptions = () => {
    if (conversionType !== "image-to-pdf") return null;

    return (
      <>
        <Form.Item
          label="Orientation"
          name="orientation"
          initialValue="portrait"
        >
          <Radio.Group>
            <Radio.Button value="portrait">Portrait</Radio.Button>
            <Radio.Button value="landscape">Landscape</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Page Type"
          name="pagetype"
          initialValue="A4"
        >
          <Select>
            <Option value="A4">A4</Option>
            <Option value="UsLetter">US Letter</Option>
            <Option value="Fit">Fit to Image</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Margin"
          name="margin"
          initialValue="none"
        >
          <Select>
            <Option value="none">None</Option>
            <Option value="small">Small</Option>
            <Option value="big">Big</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Merge Images in One PDF"
          name="mergeImagesInOnePdf"
          initialValue={true}
        >
          <Switch 
            checked={isMultipleImages}
            onChange={setIsMultipleImages}
            checkedChildren="Yes" 
            unCheckedChildren="No"
          />
        </Form.Item>
      </>
    );
  };

  return (
    <Form
      name="convert-pdf"
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Form.Item
        label="Conversion Type"
        name="conversionType"
        initialValue="doc-to-pdf"
      >
        <Radio.Group onChange={(e) => setConversionType(e.target.value)} value={conversionType}>
          <Radio.Button value="doc-to-pdf">
            <FileTextOutlined /> Document to PDF
          </Radio.Button>
          <Radio.Button value="image-to-pdf">
            <FileImageOutlined /> Images to PDF
          </Radio.Button>
          <Radio.Button value="pdf-to-pptx">
            <FilePdfOutlined /> PDF to PowerPoint
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      {renderUploadField()}

      {renderImageToPdfOptions()}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<FilePdfOutlined />}
          size="large"
        >
          {conversionType === "doc-to-pdf" && "Convert to PDF"}
          {conversionType === "image-to-pdf" && "Convert Images to PDF"}
          {conversionType === "pdf-to-pptx" && "Convert PDF to PowerPoint"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ConvertPdfForm;
