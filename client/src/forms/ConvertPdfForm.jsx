import React, { useState, useEffect } from "react";
import { Form, Button, Select, Radio, InputNumber, Switch, message, Alert } from "antd";
import { FilePdfOutlined, FileImageOutlined, FileTextOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const ConvertPdfForm = ({ onFinish, file, fileList = [], defaultType = 'doc-to-pdf', formTitle = 'Convert' }) => {
  const [conversionType, setConversionType] = useState(defaultType);
  const [mergeImagesInOnePdf, setMergeImagesInOnePdf] = useState(true);

  useEffect(() => {
    setConversionType(defaultType);
  }, [defaultType]);

  const handleFinish = (values) => {
    if (conversionType === "image-to-pdf") {
      if (!fileList || fileList.length < 1) {
        message.error("Please upload at least one image file in the upload area!");
        return;
      }
    } else {
      if (!file) {
        message.error("Please upload a file in the upload area!");
        return;
      }
    }

    const formData = {
      conversionType,
      orientation: values.orientation || "portrait",
      pagetype: values.pagetype || "A4",
      margin: values.margin || "none",
      mergeImagesInOnePdf: mergeImagesInOnePdf
    };

    onFinish(formData);
  };

  const ImageOptions = () =>
  <>
      <Form.Item label="Orientation" name="orientation" initialValue="portrait">
        <Radio.Group>
          <Radio.Button value="portrait">Portrait</Radio.Button>
          <Radio.Button value="landscape">Landscape</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="Page Type" name="pagetype" initialValue="A4">
        <Select>
          <Option value="A4">A4</Option>
          <Option value="UsLetter">US Letter</Option>
          <Option value="Fit">Fit to Image</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Margin" name="margin" initialValue="none">
        <Select>
          <Option value="none">None</Option>
          <Option value="small">Small</Option>
          <Option value="big">Big</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Merge Images in One PDF" name="mergeImagesInOnePdf" initialValue={true}>
        <Switch checked={mergeImagesInOnePdf} onChange={(checked) => setMergeImagesInOnePdf(checked)} checkedChildren="Yes" unCheckedChildren="No" />
      </Form.Item>
    </>;


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Form name="convert-pdf" layout="vertical" onFinish={handleFinish} style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {}
        <Form.Item>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>{formTitle}</div>
        </Form.Item>

        {conversionType === 'image-to-pdf' ? <ImageOptions /> : null}
      </Form>

      <Alert
        message="Conversion Instructions"
        description={conversionType === 'image-to-pdf' ? "Configure image to PDF options. Upload your images in the upload area." : "Upload your document in the upload area and click convert."}
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }} />
      

      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", background: "#fff", position: "sticky", bottom: 0, zIndex: 10 }}>
        <Button type="primary" htmlType="submit" block icon={<FilePdfOutlined />} size="large" onClick={handleFinish}>
          {conversionType === "doc-to-pdf" && "Convert to PDF"}
          {conversionType === "ppt-to-pdf" && "Convert to PDF"}
          {conversionType === "excel-to-pdf" && "Convert to PDF"}
          {conversionType === "image-to-pdf" && "Convert Images to PDF"}
          {conversionType === "pdf-to-pptx" && "Convert PDF to PowerPoint"}
        </Button>
      </div>
    </div>);

};

export default ConvertPdfForm;