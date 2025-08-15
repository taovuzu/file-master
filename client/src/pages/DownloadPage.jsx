import React, { useState, useEffect } from 'react';
import { Card, List, Button, message, Typography, Space } from 'antd';
import { DownloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import MainLayout from '@/layout/MainLayout';
import { request } from '@/request';

const { Title, Text } = Typography;

const DownloadPage = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const result = await request.list({
        entity: 'downloads',
        options: { limit: 50 }
      });
      setDownloads(result.data || []);
    } catch (error) {
      message.error('Failed to fetch downloads');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (fileId) => {
    try {
      await request.delete({
        entity: 'downloads',
        id: fileId
      });
      message.success('File deleted successfully');
      fetchDownloads();
    } catch (error) {
      message.error('Failed to delete file');
    }
  };

  const handlePreview = (file) => {
    window.open(file.url, '_blank');
  };

  return (
    <MainLayout>
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={1}>Downloads</Title>
            <Text type="secondary">Access your processed PDF files</Text>
          </div>

          <Card>
            <List
              loading={loading}
              dataSource={downloads}
              renderItem={(file) => (
                <List.Item
                  actions={[
                    <Button 
                      icon={<EyeOutlined />} 
                      onClick={() => handlePreview(file)}
                      size="small"
                    >
                      Preview
                    </Button>,
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />} 
                      onClick={() => handleDownload(file)}
                      size="small"
                    >
                      Download
                    </Button>,
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDelete(file.id)}
                      size="small"
                    >
                      Delete
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={file.name}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">Size: {file.size}</Text>
                        <Text type="secondary">Created: {new Date(file.createdAt).toLocaleDateString()}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: 'No downloads available'
              }}
            />
          </Card>
        </Space>
      </div>
    </MainLayout>
  );
};

export default DownloadPage;
