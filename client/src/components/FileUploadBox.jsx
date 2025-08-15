// src/components/FileUploadBox.jsx
import React from 'react';
import { Upload, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Text } = Typography;

/**
 * FileUploadBox component
 * @param {function} onFilesChange - Callback with file list
 * @param {boolean} multiple - Allow multiple file uploads
 * @param {string[]} accept - Allowed file types
 */
const FileUploadBox = ({
  onFilesChange,
  multiple = true,
  accept = ['.pdf'],
}) => {
  const props = {
    name: 'file',
    multiple,
    accept: accept.join(','),
    beforeUpload: (file) => {
      // Prevent auto upload
      return false;
    },
    onChange(info) {
      onFilesChange(info.fileList.map(f => f.originFileObj));
    },
    onDrop(e) {
      console.log('Dropped files:', e.dataTransfer.files);
    },
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Dragger {...props} style={{ padding: '40px 0', borderRadius: 8 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: '#E53935' }} />
        </p>
        <p className="ant-upload-text" style={{ fontSize: 18 }}>
          Drag & Drop PDF files here
        </p>
        <Text type="secondary">or click to select files</Text>
      </Dragger>
    </div>
  );
};

export default FileUploadBox;
