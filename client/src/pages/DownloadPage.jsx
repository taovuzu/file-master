import React, { useState, useEffect } from 'react';
import { Card, List, Button, message, Typography, Space, Empty } from 'antd';
import { DownloadOutlined, EyeOutlined, FileDoneOutlined, HomeOutlined } from '@ant-design/icons';
import MainLayout from '@/layout/MainLayout';
import { useSelector } from 'react-redux';
import * as pdfToolsService from '@/services/pdfToolsService';

const { Title, Text } = Typography;

const DownloadPage = () => {
  const [loading, setLoading] = useState(false);
  const [readyFile, setReadyFile] = useState(null);
  const history = useSelector((state) => state.pdfTools.history);

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const file = params.get('file');
    const url = params.get('url');
    const name = params.get('name');
    const operation = params.get('operation');

    if (file || url) {

      const deriveName = () => {
        try {
          const raw = file || (url ? decodeURIComponent(url.split('/').pop() || '') : '');
          const decoded = decodeURIComponent(raw);
          const base = decoded.includes('___') ? decoded.split('___').pop() : decoded;
          if (base && base.includes('.')) return base;
          return 'processed-document.pdf';
        } catch (e) {
          return 'processed-document.pdf';
        }
      };

      setReadyFile({
        file: file || undefined,
        url: url || undefined,
        name: name || deriveName(),
        operation: operation || undefined
      });

      window.history.replaceState({}, '', window.location.pathname);
    }


    setLoading(false);
  }, []);

  const handleDownload = (url, name) => {
    pdfToolsService.downloadFile(url, name);
  };

  const handlePreview = (url) => {
    window.open(url, '_blank');
  };

  return (
    <MainLayout>
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={1}>Downloads</Title>
            <Text type="secondary">Access your processed PDF files</Text>
          </div>

          {readyFile &&
          <Card
            style={{ borderRadius: 12 }}
            bodyStyle={{ padding: 24 }}>
            
              <Space direction="vertical" size="middle" style={{ width: '100%', alignItems: 'center' }}>
                <FileDoneOutlined style={{ fontSize: 40, color: '#52c41a' }} />
                <Title level={4} style={{ margin: 0 }}>Your file is ready</Title>
                {readyFile.operation &&
              <Text type="secondary" style={{ fontSize: '14px', textTransform: 'capitalize' }}>
                    {readyFile.operation.replace('-', ' ')} operation completed successfully
                  </Text>
              }
                <Text type="secondary">{readyFile.name}</Text>
                <Space size="middle">
                  <Button
                  type="primary"
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(readyFile.file || readyFile.url, readyFile.name)}>
                  
                    Download file
                  </Button>
                  <Button
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={() => window.location.assign('/')}>
                  
                    Go to Home
                  </Button>
                  {readyFile.operation &&
                <Button
                  size="large"
                  onClick={() => window.location.assign(`/${readyFile.operation}`)}>
                  
                      Process Another {readyFile.operation.replace('-', ' ')}
                    </Button>
                }
                </Space>
              </Space>
            </Card>
          }

          <Card>
            {history && history.length > 0 ?
            <List
              loading={loading}
              dataSource={history}
              renderItem={(item) => {
                const fileUrl = item.result;
                const fileNameFromUrl = typeof fileUrl === 'string' ? decodeURIComponent(fileUrl.split('/').pop() || '') : '';
                const displayName = fileNameFromUrl || `processed-${item.operation}.pdf`;
                return (
                  <List.Item
                    actions={[
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(fileUrl)}
                      size="small"
                      key="preview">
                      
                          Preview
                        </Button>,
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(fileUrl, displayName)}
                      size="small"
                      key="download">
                      
                          Download
                        </Button>]
                    }>
                    
                      <List.Item.Meta
                      title={displayName}
                      description={
                      <Space direction="vertical" size="small">
                            <Text type="secondary">Operation: {item.operation}</Text>
                            <Text type="secondary">Files: {(item.files || []).join(', ')}</Text>
                            <Text type="secondary">Created: {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</Text>
                          </Space>
                      } />
                    
                    </List.Item>);

              }} /> :


            <Empty description="No downloads available yet" />
            }
          </Card>
        </Space>
      </div>
    </MainLayout>);

};

export default DownloadPage;