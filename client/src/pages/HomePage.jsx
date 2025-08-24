import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Button, Card } from 'antd';
import {
  FileText,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
} from
  'lucide-react';

import MainLayout from '@/layout/MainLayout';
import ToolCard, { toolCardUtils } from '@/components/ToolCard';
const { Title, Paragraph } = Typography;

const HomePage = () => {
  const [allTools, setAllTools] = useState([]);
  useEffect(() => {
    setAllTools(toolCardUtils.getAllTools());
  }, []);

  return (
    <MainLayout>
      { }
      <section className="py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Title level={2} className="mb-4">
              Complete PDF Toolkit
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to work with PDFs. From basic operations to advanced features, we've got you covered.
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            {allTools.map((tool) =>
              <Col xs={24} sm={12} lg={8} xl={6} key={tool.key}>
                <ToolCard
                  tool={tool.key}
                  compact={true} />
              </Col>
            )}
          </Row>
        </div>
      </section>
      { }
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Title level={2} className="mb-4">
              Why Choose Our PDF Tools?
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've built the most comprehensive and user-friendly PDF processing platform available online.
            </Paragraph>
          </div>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card className="text-center border-0 shadow-sm h-full">
                <div className="mb-4">
                  <Shield className="text-green-500 mx-auto" size={48} />
                </div>
                <Title level={4} className="mb-3">Secure & Private</Title>
                <Paragraph className="text-gray-600">
                  Your files are automatically deleted after processing. We never store or access your documents.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card className="text-center border-0 shadow-sm h-full">
                <div className="mb-4">
                  <Zap className="text-blue-500 mx-auto" size={48} />
                </div>
                <Title level={4} className="mb-3">Lightning Fast</Title>
                <Paragraph className="text-gray-600">
                  Process your PDFs in seconds with our optimized cloud infrastructure and advanced algorithms.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card className="text-center border-0 shadow-sm h-full">
                <div className="mb-4">
                  <CheckCircle className="text-purple-500 mx-auto" size={48} />
                </div>
                <Title level={4} className="mb-3">High Quality</Title>
                <Paragraph className="text-gray-600">
                  Maintain the original quality of your documents while achieving optimal file sizes and formats.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
      { }
      <section className="py-20 px-6 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your PDFs?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join millions of users who trust FileMaster for their PDF needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="default"
              size="large"
              icon={<FileText className="w-5 h-5" />}
              style={{
                backgroundColor: 'white',
                color: '#667eea',
                borderColor: 'white',
                height: '48px',
                padding: '0 24px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
              Start Processing Now
            </Button>
            <Button
              type="default"
              size="large"
              icon={<ArrowRight className="w-5 h-5" />}
              style={{
                borderColor: 'white',
                color: 'white',
                backgroundColor: 'transparent',
                height: '48px',
                padding: '0 24px',
                fontSize: '16px',
                fontWeight: '600'
              }}>

              Learn More
            </Button>
          </div>
        </div>
      </section>
      { }
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">FileMaster</h3>
                  <p className="text-sm text-gray-400">PDF Tools</p>
                </div>
              </div>
              <p className="text-gray-400">
                The complete PDF solution trusted by millions of users worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Merge PDF</li>
                <li>Split PDF</li>
                <li>Compress PDF</li>
                <li>Convert PDF</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>GitHub</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>

        </div>
      </footer>
    </MainLayout>);

};

export default HomePage;