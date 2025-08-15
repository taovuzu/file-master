// src/components/Footer.jsx
import React from 'react';
import { Layout, Typography, Space } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter style={{ textAlign: 'center', backgroundColor: '#f9f9f9', padding: '20px 0' }}>
      <Space direction="vertical" size={4}>
        <Space size="middle">
          <Link href="/terms" target="_blank">Terms</Link>
          <Link href="/privacy" target="_blank">Privacy</Link>
          <Link href="/contact" target="_blank">Contact</Link>
        </Space>
        <Text type="secondary">
          © {new Date().getFullYear()} iLovePDF Clone. All rights reserved.
        </Text>
      </Space>
    </AntFooter>
  );
};

export default Footer;
