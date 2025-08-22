import React from 'react';
import { Layout, Row, Col } from 'antd';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

const { Content } = Layout;

const MainLayout = ({
  children,
  showSidebar = false,
  showHeader = true,
  showFooter = true
}) => {
  return (
    <Layout style={{ minHeight: '100vh', minWidth: '100%' }}>
      {showHeader && <Header />}
      <Layout>
        {showSidebar && <Sidebar />}
        <Layout style={{ padding: '0px' }}>
          <Content style={{ background: '#fff', padding: 0, margin: 0, minHeight: 280 }}>
            {children}
          </Content>
          {showFooter && <Footer />}
        </Layout>
      </Layout>
    </Layout>);

};

export default MainLayout;