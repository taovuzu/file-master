
import React, { useState } from "react";
import { Form, Button, message, Alert } from "antd";
import { MergeCellsOutlined, InfoCircleOutlined } from "@ant-design/icons";

const MergePdfForm = ({ onFinish, fileList = [] }) => {
  const handleFinish = () => {
    if (!fileList || fileList.length < 2) {
      message.error("Please upload at least two PDF files to merge!");
      return;
    }

    onFinish({});
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}>
      
      <Form
        name="merge-pdf"
        layout="vertical"
        onFinish={handleFinish}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px"
        }}>
        
        {}
        <Form.Item>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Merge PDFs</div>
        </Form.Item>

        {}
      </Form>

      <Alert
        message="PDF Merge Instructions"
        description="Select 2-15 PDF files in the upload area. Files will be merged in the order they appear."
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
          htmlType="submit"
          block
          icon={<MergeCellsOutlined />}
          size="large"
          disabled={!fileList || fileList.length < 2}
          onClick={handleFinish}>
          
          Merge {fileList?.length || 0} PDF{fileList && fileList.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>);

};

export default MergePdfForm;