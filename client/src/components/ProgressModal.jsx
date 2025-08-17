import React, { useEffect, useState } from 'react';
import { Modal, Progress, Button, Space, Typography, Alert } from 'antd';
import {
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  LoadingOutlined } from
'@ant-design/icons';

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
  fileName,
  isPolling = false,
  pollingAttempts = 0,
  maxPollingAttempts = 150
}) => {
  const [timeDisplay, setTimeDisplay] = useState('0s');
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);


  useEffect(() => {

    if (error || status === 'error' || status === 'polling_failed') {
      return;
    }

    if (status === 'uploading' || status === 'processing') {
      const interval = setInterval(() => {
        const elapsed = elapsedTime();
        setTimeDisplay(formatTime(elapsed));


        if (elapsed > 180 && !showTimeoutWarning) {
          setShowTimeoutWarning(true);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, elapsedTime, formatTime, showTimeoutWarning, error]);

  const getStatusIcon = () => {

    if (error) {
      return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />;
    }

    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />;
      case 'polling_failed':
        return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '24px' }} />;
      case 'uploading':
      case 'processing':
        return <LoadingOutlined style={{ color: '#1890ff', fontSize: '24px' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: '24px' }} />;
    }
  };

  const getStatusColor = () => {

    if (error) {
      return '#ff4d4f';
    }

    switch (status) {
      case 'completed':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      case 'polling_failed':
        return '#faad14';
      case 'uploading':
      case 'processing':
        return '#1890ff';
      default:
        return '#8c8c8c';
    }
  };

  const getStatusText = () => {

    if (currentStep && currentStep.trim()) {

      let stepText = currentStep;


      stepText = stepText.replace(/\d+%/, '').trim();
      stepText = stepText.replace(/\(\d+\/\d+\)/, '').trim();


      if (stepText) {
        stepText = stepText.charAt(0).toUpperCase() + stepText.slice(1);
        return stepText;
      }
    }


    switch (status) {
      case 'completed':
        return 'Completed';
      case 'error':
        return error || 'Processing Failed';
      case 'polling_failed':
        return 'Connection Issue';
      case 'uploading':
        return 'Uploading Files';
      case 'processing':
        return 'Processing Files';
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

    if (error || status === 'error') {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ marginBottom: '20px' }}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '48px', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#ff4d4f', marginBottom: '8px' }}>
              Processing Failed
            </Title>
            <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '24px' }}>
              {error || 'An error occurred during processing. Please try again.'}
            </Text>
          </div>
          <Space size="middle">
            <Button onClick={onCancel} icon={<CloseOutlined />} size="large">
              Close
            </Button>
            {onRetry &&
            <Button type="primary" onClick={onRetry} size="large">
                Try Again
              </Button>
            }
          </Space>
        </div>);

    }

    if (status === 'polling_failed') {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ marginBottom: '20px' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '48px', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#faad14', marginBottom: '8px' }}>
              Connection Issue Detected
            </Title>
            <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '24px' }}>
              Unable to check job status. The server may be experiencing issues or the job may have failed. Please try again.
            </Text>
          </div>
          <Space size="middle">
            <Button onClick={onCancel} icon={<CloseOutlined />} size="large">
              Close
            </Button>
            {onRetry &&
            <Button type="primary" onClick={onRetry} size="large">
                Try Again
              </Button>
            }
          </Space>
        </div>);

    }

    if (status === 'completed') {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ marginBottom: '20px' }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '48px', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#52c41a', marginBottom: '8px' }}>
              Processing Completed
            </Title>
            <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '24px' }}>
              Your file has been processed successfully!
            </Text>
          </div>
          <Button type="primary" onClick={onCancel} size="large">
            Continue
          </Button>
        </div>);

    }

    return (
      <div style={{ padding: '20px 0' }}>
        {!error &&
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <FileTextOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
              <Text strong>{fileName}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {getToolDisplayName()}
            </Text>
          </div>
        }

        {!error &&
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text>{currentStep}</Text>
              <Text type="secondary">{Math.round(progress)}%</Text>
            </div>
            <Progress
            percent={progress}
            status={status === 'error' || status === 'polling_failed' ? 'exception' :
            status === 'completed' ? 'success' : 'active'}
            strokeColor={getStatusColor()}
            showInfo={false} />
          
          </div>
        }

        {!error &&
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {getStatusIcon()}
              <Text style={{ marginLeft: '12px', fontWeight: 600, fontSize: '15px', color: '#1e293b' }}>
                {getStatusText()}
              </Text>
            </div>
            {(status === 'uploading' || status === 'processing') && progress > 0 && timeDisplay !== '0s' &&
          <Text style={{
            color: '#64748b',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: '#f1f5f9',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
                Time elapsed: {timeDisplay}
              </Text>
          }
          </div>
        }

        {}
        {isPolling && !error && status !== 'error' && status !== 'polling_failed' &&
        <div style={{
          padding: '12px',
          backgroundColor: '#e6f7ff',
          borderRadius: '6px',
          marginTop: '12px',
          border: '1px solid #91d5ff'
        }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Checking job status...
            </Text>
          </div>
        }

        {}
        {showTimeoutWarning && status === 'processing' && !error &&
        <Alert
          message="Processing is taking longer than expected"
          description="Your file is still being processed. This may take a few more minutes for large files or complex operations."
          type="warning"
          showIcon
          style={{ marginTop: '12px' }} />

        }

      </div>);

  };

  return (
    <Modal
      title={
      <div style={{ display: 'flex', alignItems: 'center' }}>
          {getStatusIcon()}
          <span style={{ marginLeft: '8px' }}>
            {error ? 'Processing Failed' :
          status === 'completed' ? 'Processing Complete' :
          status === 'error' ? 'Processing Failed' :
          status === 'polling_failed' ? 'Connection Issue' :
          'Processing PDF'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
      closable={status === 'completed' || status === 'error' || status === 'polling_failed'}
      maskClosable={status === 'completed' || status === 'error' || status === 'polling_failed'}>
      
      {renderProgressContent()}
    </Modal>);

};

export default ProgressModal;