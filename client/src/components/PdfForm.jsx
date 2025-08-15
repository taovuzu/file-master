import React from 'react';
import { Form, Button, Select, InputNumber, Input, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

// Import constants and utilities
import { 
  FORM_TYPES, 
  COMPRESSION_LEVELS, 
  ROTATION_ANGLES, 
  WATERMARK_POSITIONS, 
  PAGE_NUMBER_FORMATS, 
  CONVERT_FORMATS, 
  SPLIT_METHODS 
} from '@/utils/constants';
import { getValidationRules } from '@/utils/validation';
import { logUserAction } from '@/utils/logger';

const { Option } = Select;

/**
 * Unified PDF form component that can be configured for different PDF operations
 * @param {Object} props - Component props
 * @param {string} props.formType - Type of form to render
 * @param {Function} props.onFinish - Callback function when form is submitted
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.loading - Whether the form is in loading state
 * @param {Object} props.config - Additional configuration options
 * @returns {JSX.Element} Rendered form component
 */
const PdfForm = ({
  formType = FORM_TYPES.COMPRESS,
  onFinish,
  disabled = false,
  loading = false,
  config = {}
}) => {
  const [form] = Form.useForm();

  /**
   * Render form fields based on form type
   * @returns {JSX.Element} Form fields JSX
   */
  const renderFormFields = () => {
    switch (formType) {
      case FORM_TYPES.COMPRESS:
        return (
          <Form.Item
            label="Compression Level"
            name="level"
            rules={getValidationRules('required')}
          >
            <Select placeholder="Select compression level">
              <Option value={COMPRESSION_LEVELS.LOW}>
                Low (Better quality, larger file)
              </Option>
              <Option value={COMPRESSION_LEVELS.MEDIUM}>
                Medium (Balanced)
              </Option>
              <Option value={COMPRESSION_LEVELS.HIGH}>
                High (Smaller file, lower quality)
              </Option>
            </Select>
          </Form.Item>
        );

      case FORM_TYPES.PROTECT:
        return (
          <>
            <Form.Item
              label="Password"
              name="password"
              rules={getValidationRules('password')}
            >
              <Input.Password placeholder="Enter password to protect PDF" />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={getValidationRules('confirmPassword')}
            >
              <Input.Password placeholder="Confirm password" />
            </Form.Item>
          </>
        );

      case FORM_TYPES.UNLOCK:
        return (
          <Form.Item
            label="Password"
            name="password"
            rules={getValidationRules('required')}
          >
            <Input.Password placeholder="Enter PDF password to unlock" />
          </Form.Item>
        );

      case FORM_TYPES.SPLIT:
        return (
          <>
            <Form.Item
              label="Split Method"
              name="method"
              rules={getValidationRules('required')}
            >
              <Select placeholder="Select split method">
                <Option value={SPLIT_METHODS.PAGES}>Split by page numbers</Option>
                <Option value={SPLIT_METHODS.RANGE}>Split by page range</Option>
                <Option value={SPLIT_METHODS.COUNT}>Split into equal parts</Option>
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.method !== currentValues.method}
            >
              {({ getFieldValue }) => {
                const method = getFieldValue('method');
                if (method === SPLIT_METHODS.PAGES) {
                  return (
                    <Form.Item
                      label="Page Numbers"
                      name="pages"
                      rules={getValidationRules('required')}
                    >
                      <Input placeholder="e.g., 1,3,5-7" />
                    </Form.Item>
                  );
                }
                if (method === SPLIT_METHODS.RANGE) {
                  return (
                    <Space>
                      <Form.Item
                        label="From Page"
                        name="fromPage"
                        rules={getValidationRules('required')}
                      >
                        <InputNumber min={1} placeholder="From" />
                      </Form.Item>
                      <Form.Item
                        label="To Page"
                        name="toPage"
                        rules={getValidationRules('required')}
                      >
                        <InputNumber min={1} placeholder="To" />
                      </Form.Item>
                    </Space>
                  );
                }
                if (method === SPLIT_METHODS.COUNT) {
                  return (
                    <Form.Item
                      label="Number of Parts"
                      name="parts"
                      rules={getValidationRules('required')}
                    >
                      <InputNumber min={2} placeholder="Number of parts" />
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>
          </>
        );

      case FORM_TYPES.CONVERT:
        return (
          <Form.Item
            label="Convert To"
            name="format"
            rules={getValidationRules('required')}
          >
            <Select placeholder="Select output format">
              <Option value={CONVERT_FORMATS.DOCX}>Word Document (.docx)</Option>
              <Option value={CONVERT_FORMATS.XLSX}>Excel Spreadsheet (.xlsx)</Option>
              <Option value={CONVERT_FORMATS.JPG}>Images (.jpg)</Option>
              <Option value={CONVERT_FORMATS.PNG}>Images (.png)</Option>
            </Select>
          </Form.Item>
        );

      case FORM_TYPES.WATERMARK:
        return (
          <>
            <Form.Item
              label="Watermark Text"
              name="text"
              rules={getValidationRules('required')}
            >
              <Input placeholder="Enter watermark text" />
            </Form.Item>
            <Form.Item
              label="Position"
              name="position"
              initialValue={WATERMARK_POSITIONS.CENTER}
            >
              <Select>
                <Option value={WATERMARK_POSITIONS.TOP_LEFT}>Top Left</Option>
                <Option value={WATERMARK_POSITIONS.TOP_CENTER}>Top Center</Option>
                <Option value={WATERMARK_POSITIONS.TOP_RIGHT}>Top Right</Option>
                <Option value={WATERMARK_POSITIONS.CENTER_LEFT}>Center Left</Option>
                <Option value={WATERMARK_POSITIONS.CENTER}>Center</Option>
                <Option value={WATERMARK_POSITIONS.CENTER_RIGHT}>Center Right</Option>
                <Option value={WATERMARK_POSITIONS.BOTTOM_LEFT}>Bottom Left</Option>
                <Option value={WATERMARK_POSITIONS.BOTTOM_CENTER}>Bottom Center</Option>
                <Option value={WATERMARK_POSITIONS.BOTTOM_RIGHT}>Bottom Right</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Opacity"
              name="opacity"
              initialValue={0.5}
            >
              <InputNumber min={0} max={1} step={0.1} />
            </Form.Item>
          </>
        );

      case FORM_TYPES.ROTATE:
        return (
          <Form.Item
            label="Rotation Angle"
            name="angle"
            rules={getValidationRules('required')}
          >
            <Select placeholder="Select rotation angle">
              <Option value={ROTATION_ANGLES.NINETY}>90° Clockwise</Option>
              <Option value={ROTATION_ANGLES.ONE_EIGHTY}>180°</Option>
              <Option value={ROTATION_ANGLES.TWO_SEVENTY}>90° Counter-clockwise</Option>
            </Select>
          </Form.Item>
        );

      case FORM_TYPES.PAGE_NUMBERS:
        return (
          <>
            <Form.Item
              label="Position"
              name="position"
              initialValue={WATERMARK_POSITIONS.BOTTOM_CENTER}
            >
              <Select>
                <Option value={WATERMARK_POSITIONS.TOP_LEFT}>Top Left</Option>
                <Option value={WATERMARK_POSITIONS.TOP_CENTER}>Top Center</Option>
                <Option value={WATERMARK_POSITIONS.TOP_RIGHT}>Top Right</Option>
                <Option value={WATERMARK_POSITIONS.BOTTOM_LEFT}>Bottom Left</Option>
                <Option value={WATERMARK_POSITIONS.BOTTOM_CENTER}>Bottom Center</Option>
                <Option value={WATERMARK_POSITIONS.BOTTOM_RIGHT}>Bottom Right</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Start Number"
              name="startNumber"
              initialValue={1}
            >
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item
              label="Format"
              name="format"
              initialValue={PAGE_NUMBER_FORMATS.NUMERIC}
            >
              <Select>
                <Option value={PAGE_NUMBER_FORMATS.NUMERIC}>1, 2, 3...</Option>
                <Option value={PAGE_NUMBER_FORMATS.ROMAN_LOWER}>i, ii, iii...</Option>
                <Option value={PAGE_NUMBER_FORMATS.ROMAN_UPPER}>I, II, III...</Option>
                <Option value={PAGE_NUMBER_FORMATS.ALPHA_LOWER}>a, b, c...</Option>
                <Option value={PAGE_NUMBER_FORMATS.ALPHA_UPPER}>A, B, C...</Option>
              </Select>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  /**
   * Handle form submission
   * @param {Object} values - Form values
   */
  const handleFinish = (values) => {
    logUserAction('pdf_form_submitted', { formType, values });
    if (onFinish) {
      onFinish(values);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ maxWidth: 500, margin: '0 auto' }}
    >
      {renderFormFields()}
      
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          icon={<UploadOutlined />}
          size="large"
          loading={loading}
          disabled={disabled}
        >
          {config.buttonText || 'Process PDF'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PdfForm;

