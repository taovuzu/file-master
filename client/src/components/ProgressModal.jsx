import React, { useEffect, useState } from 'react';
import { Modal, Progress, Button, Space, Typography, Alert } from 'antd';
import { 
  CloseOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const ProgressModal = ({ 
  visible, 
  progress, 
  status, 
  currentStep, 
  error, 
  onCancel, 
  onRetry,
  elapsedTime,
  formatTime,
  toolType,
  fileName
}) => {
  const [timeDisplay, setTimeDisplay] = useState('0s');

  // Update time display every second
  useEffect(() => {
    if (status === 'uploading' || status === 'processing') {
      const interval = setInterval(() => {
        setTimeDisplay(formatTime(elapsedTime()));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, elapsedTime, formatTime]);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />;
      case 'uploading':
      case 'processing':
        return <LoadingOutlined style={{ color: '#1890ff', fontSize: '24px' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: '24px' }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      case 'uploading':
      case 'processing':
        return '#1890ff';
      default:
        return '#8c8c8c';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      case 'uploading':
        return 'Uploading';
      case 'processing':
        return 'Processing';
      default:
        return 'Preparing';
    }
  };

  const getToolDisplayName = () => {
    const toolNames = {
      'merge': 'Merge PDFs',
      'split': 'Split PDF',
      'compress': 'Compress PDF',
      'convert': 'Convert PDF',
      'protect': 'Protect PDF',
      'unlock': 'Unlock PDF',
      'rotate': 'Rotate PDF',
      'watermark': 'Add Watermark',
      'page-numbers': 'Add Page Numbers'
    };
    return toolNames[toolType] || toolType;
  };

  const renderProgressContent = () => {
    if (status === 'error') {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Alert
            message="Processing Failed"
            description={error || 'An error occurred during processing'}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          <Space>
            <Button onClick={onCancel} icon={<CloseOutlined />}>
              Close
            </Button>
            {onRetry && (
              <Button type="primary" onClick={onRetry}>
                Retry
              </Button>
            )}
          </Space>
        </div>
      );
    }

    if (status === 'completed') {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Alert
            message="Processing Completed"
            description="Your file has been processed successfully!"
            type="success"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          <Button type="primary" onClick={onCancel}>
            Continue
          </Button>
        </div>
      );
    }

    return (
      <div style={{ padding: '20px 0' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <FileTextOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
            <Text strong>{fileName}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {getToolDisplayName()}
          </Text>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text>{currentStep}</Text>
            <Text type="secondary">{Math.round(progress)}%</Text>
          </div>
          <Progress 
            percent={progress} 
            status={status === 'error' ? 'exception' : 'active'}
            strokeColor={getStatusColor()}
            showInfo={false}
          />
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {getStatusIcon()}
            <Text style={{ marginLeft: '8px', fontWeight: 500 }}>
              {getStatusText()}
            </Text>
          </div>
          <Text type="secondary">
            Time elapsed: {timeDisplay}
          </Text>
        </div>

        {(status === 'uploading' || status === 'processing') && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button onClick={onCancel} danger>
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon()}
          <span style={{ marginLeft: '8px' }}>
            {status === 'completed' ? 'Processing Complete' : 
             status === 'error' ? 'Processing Failed' : 
             'Processing PDF'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
      closable={status === 'completed' || status === 'error'}
      maskClosable={status === 'completed' || status === 'error'}
    >
      {renderProgressContent()}
    </Modal>
  );
};

export default ProgressModal;



