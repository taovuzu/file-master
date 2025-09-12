import React from 'react';
import { Layout, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;

const AuthLayout = ({
  children,
  title = "Welcome",
  subtitle = "Please sign in to continue",
  showBackLink = true
}) => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ marginBottom: '8px' }}>
              {title}
            </Title>
            <Typography.Text type="secondary">
              {subtitle}
            </Typography.Text>
          </div>
          
          {children}
          
          {showBackLink &&
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Typography.Link onClick={() => navigate('/')}>
                ← Back to Home
              </Typography.Link>
            </div>
          }
        </Card>
      </Content>
    </Layout>);

};

export default AuthLayout;