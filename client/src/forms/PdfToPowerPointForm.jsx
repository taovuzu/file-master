import React from "react";
import { Form, Button, Alert, message } from "antd";
import { FilePdfOutlined, InfoCircleOutlined } from "@ant-design/icons";

const PdfToPowerPointForm = ({ onFinish, file }) => {
  const handleFinish = () => {
    if (!file) {
      message.error("Please upload a PDF file first!");
      return;
    }
    onFinish({ conversionType: 'pdf-to-pptx' });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Form name="pdf-to-pptx" layout="vertical" onFinish={handleFinish} style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <Form.Item>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>PDF to PowerPoint</div>
        </Form.Item>
      </Form>

      <Alert
        message="Conversion Instructions"
        description="Upload your PDF in the upload area, then click convert to generate an editable PowerPoint presentation."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }} />
      

      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0", background: "#fff", position: "sticky", bottom: 0, zIndex: 10 }}>
        <Button type="primary" htmlType="submit" block icon={<FilePdfOutlined />} size="large" disabled={!file} onClick={handleFinish}>
          Convert PDF to PowerPoint
        </Button>
      </div>
    </div>);

};

export default PdfToPowerPointForm;