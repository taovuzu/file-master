
import React, { useState } from "react";
import {
  Form,
  Button,
  Select,
  Radio,
  InputNumber,
  Switch,
  message,
  Alert,
  Divider,
  Row,
  Col,
  ColorPicker } from
"antd";
import {
  FileTextOutlined,
  InfoCircleOutlined,
  FontSizeOutlined } from
"@ant-design/icons";

const { Option } = Select;

const PageNumbersPdfForm = ({ onFinish, file }) => {
  const [form] = Form.useForm();
  const [textColor, setTextColor] = useState([0, 0, 0]);

  const handleFinish = (values) => {
    if (!file) {
      message.error("Please upload a PDF file first!");
      return;
    }

    if (values.fromPage > values.toPage) {
      message.error("From page cannot be greater than To page!");
      return;
    }

    let finalColor = "#000000";
    if (typeof textColor === "string") {
      finalColor = textColor;
    } else if (textColor && textColor.toHexString) {
      finalColor = textColor.toHexString();
    }

    onFinish({
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Form
        form={form}
        name="page-numbers-pdf"
        layout="vertical"
        onFinish={handleFinish}
        style={{ flex: 1, overflowY: "auto", padding: "16px" }}
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
        }}>
        
        <Form.Item>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>
            Add Page Numbers
          </div>
        </Form.Item>

        <Divider orientation="left">Page Range Settings</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Page Mode" name="pageMode">
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
              valuePropName="checked">
              
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="From Page"
              name="fromPage"
              rules={[{ required: true, message: "Enter start page!" }]}>
              
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="To Page"
              name="toPage"
              rules={[{ required: true, message: "Enter end page!" }]}>
              
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="First Number"
              name="firstNumber"
              rules={[{ required: true, message: "Enter first number!" }]}>
              
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Page Number Style</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Position" name="position">
              <Select>
                <Option value="top-left">Top Left</Option>
                <Option value="top-right">Top Right</Option>
                <Option value="bottom-left">Bottom Left</Option>
                <Option value="bottom-right">Bottom Right</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Margin" name="margin">
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
            <Form.Item label="Text Style" name="textStyle">
              <Select>
                <Option value={0}>Just Number (1)</Option>
                <Option value={1}>Page Number (Page 1)</Option>
                <Option value={2}>Page X of Y (Page 1 of N)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Font Family" name="fontFamily">
              <Select>
                <Option value="Arial">Arial</Option>
                <Option value="Times New Roman">Times New Roman</Option>
                <Option value="Courier">Courier</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Font Size" name="fontSize">
              <Select>
                <Option value="small">Small</Option>
                <Option value="normal">Normal</Option>
                <Option value="large">Large</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Text Color" name="textColor">
          <ColorPicker
            value={textColor}
            onChange={setTextColor}
            showText
            presets={[
            {
              label: "Recommended",
              colors: [
              "#000000",
              "#FFFFFF",
              "#FF0000",
              "#0000FF",
              "#008000",
              "#800080",
              "#FFA500",
              "#808080"]

            }]
            } />
          
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
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1890ff",
                marginBottom: "16px"
              }}>
              
              <FontSizeOutlined style={{ marginRight: "8px" }} />
              Page Number Preview
            </div>
            <div
              style={{ fontSize: "14px", color: "#333", marginBottom: "8px" }}>
              
              Style: <strong>1</strong>
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Position: <strong>Bottom Right</strong> • Font:{" "}
              <strong>Arial</strong> • Size: <strong>Normal</strong>
            </div>
          </div>
        </Form.Item>
      </Form>

      <Alert
        message="Page Numbers Instructions"
        description="Configure page number settings. Upload your PDF in the upload area. Choose page range, style, and formatting options."
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
          icon={<FileTextOutlined />}
          size="large"
          disabled={!file}
          onClick={() => form.submit()}>
          
          Add Page Numbers to PDF
        </Button>
      </div>
    </div>);

};

export default PageNumbersPdfForm;