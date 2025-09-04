
import React, { useState } from "react";
import { Form, Button, Select, Radio, InputNumber, Alert, Divider, Row, Col, ColorPicker, Input, Slider, message } from "antd";
import { FileTextOutlined, FileImageOutlined, InfoCircleOutlined, FontSizeOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const WatermarkPdfForm = ({ onFinish, file }) => {
  const [form] = Form.useForm();
  const [watermarkType, setWatermarkType] = useState("text");
  const [textColor, setTextColor] = useState("#000000");

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();

      if (!file) {
        message.error("Please upload a PDF file first!");
        return;
      }

      if (values.fromPage > values.toPage) {
        message.error("From page cannot be greater than To page!");
        return;
      }

      const finalColor = textColor;

      const formData = {
        watermarkType,
        fromPage: values.fromPage || 1,
        toPage: values.toPage || 1,
        position: values.position || "bottom-right",
        transparency: values.transparency ?? 0.5,
        rotation: values.rotation ?? 0,
        layer: values.layer || "overlay"
      };

      if (watermarkType === "text") {
        formData.text = values.text || "WATERMARK";
        formData.fontFamily = values.fontFamily || "Arial";
        formData.fontSize = values.fontSize || "normal";
        formData.textColor = finalColor;
      } else if (watermarkType === "image") {
        if (!values.imageProvided) {
          message.error("Image watermark requires an image source.");
          return;
        }
      }

      onFinish(formData);
    } catch (error) {
    }
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
  { value: "mosaic", label: "Mosaic (Repeated)" }];


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Form
        form={form}
        name="watermark-pdf"
        layout="vertical"
        onFinish={handleFinish}
        style={{ flex: 1, overflowY: "auto", padding: "16px" }}
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
        }}>
        
        {}
        <Form.Item>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Add Watermark</div>
        </Form.Item>

        <Divider orientation="left">Watermark Type</Divider>
        <Form.Item label="Watermark Type" name="watermarkType" initialValue="text">
          <Radio.Group onChange={(e) => setWatermarkType(e.target.value)} value={watermarkType}>
            <Radio.Button value="text">
              <FileTextOutlined /> Text Watermark
            </Radio.Button>
            <Radio.Button value="image">
              <FileImageOutlined /> Image Watermark
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {watermarkType === "text" &&
        <>
            <Divider orientation="left">Text Watermark Settings</Divider>
            <Form.Item label="Watermark Text" name="text" rules={[{ required: true, message: "Enter watermark text!" }]}>
              <TextArea rows={3} placeholder="Enter your watermark text here..." maxLength={100} showCount />
            </Form.Item>
            <Row gutter={16}>
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
              <Col span={8}>
                <Form.Item label="Text Color" name="textColor">
                  <ColorPicker
                  value={textColor}
                  onChange={(color) => setTextColor(color.toHexString())}
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
              </Col>
            </Row>
          </>
        }

        <Divider orientation="left">Watermark Properties</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="From Page" name="fromPage" rules={[{ required: true, message: "Enter start page!" }]}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="To Page" name="toPage" rules={[{ required: true, message: "Enter end page!" }]}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Position" name="position">
              <Select>
                {getPositionOptions().map((option) =>
                <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Layer" name="layer">
              <Select>
                <Option value="overlay">Overlay (Above content)</Option>
                <Option value="background">Background (Behind content)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Transparency" name="transparency" help="0 = Fully transparent, 1 = Fully opaque">
              <Slider min={0} max={1} step={0.1} marks={{ 0: "0%", 0.5: "50%", 1: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Rotation (degrees)" name="rotation" help="Rotation angle in degrees">
              <InputNumber min={0} max={360} style={{ width: "100%" }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f6f8fa",
              borderRadius: "8px",
              border: "2px solid #1890ff",
              textAlign: "center"
            }}>
            
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1890ff", marginBottom: "16px" }}>
              <FontSizeOutlined style={{ marginRight: "8px" }} />
              Watermark Preview
            </div>
            <div style={{ fontSize: "14px", color: "#333", marginBottom: "8px" }}>
              Type: <strong>{watermarkType === "text" ? "Text" : "Image"}</strong> • Position:{" "}
              <strong>Bottom Right</strong>
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Transparency: <strong>50%</strong> • Rotation: <strong>0°</strong> • Layer: <strong>Overlay</strong>
            </div>
          </div>
        </Form.Item>
      </Form>

      <Alert
        message="Add Watermark Instructions"
        description="Configure watermark settings. Upload your PDF in the upload area. Text watermark is supported here. Image watermark can be integrated with a separate image selector."
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
          onClick={handleFinish}>
          
          Add {watermarkType === "text" ? "Text" : "Image"} Watermark to PDF
        </Button>
      </div>
    </div>);

};

export default WatermarkPdfForm;