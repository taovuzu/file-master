import React from 'react';
import { Button, Typography, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';

const { Title, Text } = Typography;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout showSidebar={false}>
      <div style={{
        textAlign: 'center',
        padding: '100px 20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={1} style={{ fontSize: '120px', margin: 0, color: '#1890ff' }}>
              404
            </Title>
            <Title level={2}>Page Not Found</Title>
            <Text type="secondary" style={{ fontSize: '18px' }}>
              The page you're looking for doesn't exist or has been moved.
            </Text>
          </div>

          <Space size="middle">
            <Button
              type="primary"
              icon={<HomeOutlined />}
              size="large"
              onClick={() => navigate('/')}>
              
              Go Home
            </Button>
            <Button
              icon={<ArrowLeftOutlined />}
              size="large"
              onClick={() => navigate(-1)}>
              
              Go Back
            </Button>
          </Space>

          <div>
            <Text type="secondary">
              Or try one of these popular tools:{' '}
              <Link to="/merge">Merge PDF</Link>,{' '}
              <Link to="/compress">Compress PDF</Link>,{' '}
              <Link to="/convert">Convert PDF</Link>
            </Text>
          </div>
        </Space>
      </div>
    </MainLayout>);

};

export default NotFoundPage;