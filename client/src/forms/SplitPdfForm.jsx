
import React, { useState } from "react";
import { Form, Button, InputNumber, message, Alert, Divider, Space } from "antd";
import { PartitionOutlined, InfoCircleOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const SplitPdfForm = ({ onFinish, file }) => {
  const [ranges, setRanges] = useState([{ start: 1, end: 1 }]);

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
    const numeric = typeof value === 'number' ? value : parseInt(value, 10);
    if (!Number.isFinite(numeric) || numeric < 1) return;
    setRanges((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: numeric };
      return next;
    });
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

  const handleFinish = () => {
    if (!file) {
      message.error("Please upload a PDF file!");
      return;
    }

    if (!validateRanges()) {
      return;
    }

    const rangesArray = ranges.map((range) => [range.start, range.end]);
    onFinish({ ranges: rangesArray });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Form
        name="split-pdf"
        layout="vertical"
        onFinish={handleFinish}
        style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        
        <Form.Item>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Split PDF</div>
        </Form.Item>

        <Divider orientation="left">Page Ranges</Divider>

        <Form.Item label="Define Page Ranges" help="Specify which pages to extract. Each range creates a separate PDF.">
          {ranges.map((range, index) =>
          <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <span style={{ minWidth: '60px' }}>Range {index + 1}:</span>
              <InputNumber
              min={1}
              placeholder="Start"
              value={range.start}
              onChange={(val) => updateRange(index, 'start', val)}
              style={{ width: '100px' }} />
            
              <span>to</span>
              <InputNumber
              min={1}
              placeholder="End"
              value={range.end}
              onChange={(val) => updateRange(index, 'end', val)}
              style={{ width: '100px' }} />
            
              {ranges.length > 1 &&
            <Button
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => removeRange(index)}
              size="small" />

            }
            </Space>
          )}

          <Button type="dashed" onClick={addRange} icon={<PlusOutlined />} style={{ marginTop: 8 }}>
            Add Another Range
          </Button>
        </Form.Item>

        {ranges.length > 0 &&
        <Form.Item>
            <div style={{ padding: '12px', backgroundColor: '#f6f8fa', borderRadius: '6px', border: '1px solid #e1e4e8' }}>
              <strong>Ranges to extract ({ranges.length}):</strong>
              <div style={{ marginTop: '8px', fontSize: '13px' }}>
                {ranges.map((range, index) =>
              <div key={index} style={{ marginBottom: '4px', color: '#586069' }}>
                    Range {index + 1}: Pages {range.start} - {range.end}
                  </div>
              )}
              </div>
            </div>
          </Form.Item>
        }
      </Form>

      <Alert
        message="PDF Split Instructions"
        description="Specify one or more page ranges. Each range will become a separate PDF and will be packaged in a ZIP archive."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }} />
      

      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', background: '#fff', position: 'sticky', bottom: 0, zIndex: 10 }}>
        <Button type="primary" htmlType="submit" block icon={<PartitionOutlined />} size="large" disabled={!file || ranges.length === 0} onClick={handleFinish}>
          Split PDF into {ranges.length} File{ranges.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>);

};

export default SplitPdfForm;