import React, { useState } from 'react';
import { Card, Typography, Collapse, Tabs, Form, Input, Button, message, Space, Divider, Row, Col } from 'antd';
import {
  QuestionCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  SendOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined } from
'@ant-design/icons';
import MainLayout from '@/layout/MainLayout';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const HelpCenterPage = ({ initialTab = 'help' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleContactSubmit = async (values) => {
    setLoading(true);
    try {

      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Your message has been sent successfully! We\'ll get back to you soon.');
      form.resetFields();
    } catch (error) {
      message.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const faqItems = [
  {
    key: '1',
    label: 'How do I merge multiple PDF files?',
    children:
    <div className="text-gray-600">
          <Paragraph>
            To merge PDF files:
          </Paragraph>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to the "Merge PDF" tool from the homepage</li>
            <li>Upload multiple PDF files by dragging and dropping or clicking "Select Files"</li>
            <li>Arrange the files in your desired order</li>
            <li>Click "Merge PDFs" to combine them into a single file</li>
            <li>Download your merged PDF</li>
          </ol>
        </div>

  },
  {
    key: '2',
    label: 'Is my data secure when using FileMaster?',
    children:
    <Paragraph className="text-gray-600">
          Yes, your data is completely secure. We use end-to-end encryption for all file transfers, 
          and all uploaded files are automatically deleted from our servers after processing. 
          We never store or access your documents.
        </Paragraph>

  },
  {
    key: '3',
    label: 'What file size limits do you have?',
    children:
    <Paragraph className="text-gray-600">
          Free users can upload files up to 50MB per file. Premium users can upload files up to 200MB per file.
          For larger files, please contact our support team for assistance.
        </Paragraph>

  },
  {
    key: '4',
    label: 'Can I use FileMaster without creating an account?',
    children:
    <Paragraph className="text-gray-600">
          Yes! You can use all our PDF tools without creating an account. However, creating a free account 
          allows you to save your processing history and access premium features.
        </Paragraph>

  },
  {
    key: '5',
    label: 'How do I compress a PDF while maintaining quality?',
    children:
    <div className="text-gray-600">
          <Paragraph>
            Our PDF compression tool uses advanced algorithms to reduce file size while preserving quality:
          </Paragraph>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Upload your PDF file to the "Compress PDF" tool</li>
            <li>Choose your compression level (Low, Medium, High)</li>
            <li>Click "Compress PDF"</li>
            <li>Download your optimized file</li>
          </ol>
        </div>

  }];


  const tabItems = [
  {
    key: 'help',
    label:
    <span className="flex items-center gap-2">
          <QuestionCircleOutlined />
          Help Center
        </span>,

    children:
    <div className="space-y-8">
          <div>
            <Title level={3} className="text-gray-900 mb-6">Frequently Asked Questions</Title>
            <Collapse
          items={faqItems}
          defaultActiveKey={['1']}
          expandIconPosition="start"
          className="bg-white border border-gray-200 rounded-lg" />
        
          </div>

          <div>
            <Title level={3} className="text-gray-900 mb-6">Getting Started</Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card className="card-modern h-full border border-gray-200 hover:shadow-medium transition-all duration-200">
                  <Title level={4} className="text-primary-600 mb-3">Quick Start Guide</Title>
                  <Paragraph className="text-gray-600 mb-4">
                    Learn how to use our PDF tools effectively with our step-by-step guide.
                  </Paragraph>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Choose the right tool for your needs</li>
                    <li>Upload your files securely</li>
                    <li>Process and download results</li>
                  </ul>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card className="card-modern h-full border border-gray-200 hover:shadow-medium transition-all duration-200">
                  <Title level={4} className="text-primary-600 mb-3">Video Tutorials</Title>
                  <Paragraph className="text-gray-600 mb-4">
                    Watch our video tutorials to master PDF processing techniques.
                  </Paragraph>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Merging and splitting PDFs</li>
                    <li>Adding watermarks and signatures</li>
                    <li>Converting between formats</li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

  },
  {
    key: 'contact',
    label:
    <span className="flex items-center gap-2">
          <MailOutlined />
          Contact Us
        </span>,

    children:
    <div className="space-y-8">
          <div>
            <Title level={3} className="text-gray-900 mb-6">Get in Touch</Title>
            <Row gutter={[24, 24]} className="mb-8">
              <Col xs={24} md={8}>
                <Card className="card-modern text-center border border-gray-200 hover:shadow-medium transition-all duration-200">
                  <div className="p-6">
                    <MailOutlined className="text-4xl text-primary-600 mb-4" />
                    <Title level={4} className="text-gray-900 mb-2">Email Support</Title>
                    <Text className="text-primary-600 font-medium">support@filemaster.com</Text>
                    <br />
                    <Text className="text-gray-500 text-sm">Response within 24 hours</Text>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card className="card-modern text-center border border-gray-200 hover:shadow-medium transition-all duration-200">
                  <div className="p-6">
                    <PhoneOutlined className="text-4xl text-primary-600 mb-4" />
                    <Title level={4} className="text-gray-900 mb-2">Phone Support</Title>
                    <Text className="text-primary-600 font-medium">+1 (555) 123-4567</Text>
                    <br />
                    <Text className="text-gray-500 text-sm">Mon-Fri 9AM-6PM EST</Text>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card className="card-modern text-center border border-gray-200 hover:shadow-medium transition-all duration-200">
                  <div className="p-6">
                    <CustomerServiceOutlined className="text-4xl text-primary-600 mb-4" />
                    <Title level={4} className="text-gray-900 mb-2">Live Chat</Title>
                    <Text className="text-primary-600 font-medium">Available 24/7</Text>
                    <br />
                    <Text className="text-gray-500 text-sm">Instant assistance</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

          <Card className="card-modern border border-gray-200 rounded-2xl">
            <Title level={4} className="text-gray-900 mb-6">Send us a Message</Title>
            <Form
          form={form}
          layout="vertical"
          onFinish={handleContactSubmit}>
          
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                name="name"
                label={<span className="text-gray-700 font-medium">Name</span>}
                rules={[{ required: true, message: 'Please enter your name!' }]}>
                
                    <Input
                  placeholder="Your name"
                  className="input-modern h-12" />
                
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                name="email"
                label={<span className="text-gray-700 font-medium">Email</span>}
                rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }]
                }>
                
                    <Input
                  placeholder="your.email@example.com"
                  className="input-modern h-12" />
                
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
            name="subject"
            label={<span className="text-gray-700 font-medium">Subject</span>}
            rules={[{ required: true, message: 'Please enter a subject!' }]}>
            
                <Input
              placeholder="How can we help you?"
              className="input-modern h-12" />
            
              </Form.Item>

              <Form.Item
            name="message"
            label={<span className="text-gray-700 font-medium">Message</span>}
            rules={[{ required: true, message: 'Please enter your message!' }]}>
            
                <TextArea
              rows={6}
              placeholder="Please describe your issue or question in detail..."
              className="input-modern" />
            
              </Form.Item>

              <Form.Item>
                <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              size="large"
              className="btn-primary h-12 px-8">
              
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

  },
  {
    key: 'privacy',
    label:
    <span className="flex items-center gap-2">
          <SafetyCertificateOutlined />
          Privacy Policy
        </span>,

    children:
    <div className="space-y-6">
          <div className="text-center mb-8">
            <Title level={3} className="text-gray-900">Privacy Policy</Title>
            <Text className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</Text>
          </div>

          <Card className="card-modern border border-gray-200 rounded-2xl">
            <Title level={4} className="text-primary-600 mb-4">Information We Collect</Title>
            <Paragraph className="text-gray-600 mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support.
            </Paragraph>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Account Information:</strong> Email, name, and password when you register</li>
              <li><strong>Usage Data:</strong> Information about how you use our services</li>
              <li><strong>File Metadata:</strong> Basic information about uploaded files (not content)</li>
              <li><strong>Communication Data:</strong> Records of your communications with us</li>
            </ul>
          </Card>

          <Card className="card-modern border border-gray-200 rounded-2xl">
            <Title level={4} className="text-primary-600 mb-4">How We Use Your Information</Title>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your PDF files and deliver results</li>
              <li>Communicate with you about our services</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </Card>

          <Card className="card-modern border border-gray-200 rounded-2xl">
            <Title level={4} className="text-primary-600 mb-4">Data Security</Title>
            <Paragraph className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your information:
            </Paragraph>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>End-to-end encryption for all file transfers</li>
              <li>Automatic deletion of files after processing</li>
              <li>Secure servers with regular security audits</li>
              <li>Access controls and monitoring systems</li>
            </ul>
          </Card>

          <Card className="card-modern border border-gray-200">
            <Title level={4} className="text-primary-600 mb-4">Your Rights</Title>
            <Paragraph className="text-gray-600 mb-4">
              You have certain rights regarding your personal information:
            </Paragraph>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Access and update your account information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability for your information</li>
            </ul>
          </Card>
        </div>

  },
  {
    key: 'terms',
    label:
    <span className="flex items-center gap-2">
          <FileTextOutlined />
          Terms of Service
        </span>,

    children:
    <div className="space-y-6">
          <div className="text-center mb-8">
            <Title level={3} className="text-gray-900">Terms of Service</Title>
            <Text className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</Text>
          </div>

          <Card className="card-modern border border-gray-200">
            <Title level={4} className="text-primary-600 mb-4">Acceptance of Terms</Title>
            <Paragraph className="text-gray-600">
              By accessing and using FileMaster, you accept and agree to be bound by the terms 
              and provision of this agreement. These terms apply to all visitors, users, and 
              others who access or use the service.
            </Paragraph>
          </Card>

          <Card className="card-modern border border-gray-200">
            <Title level={4} className="text-primary-600 mb-4">Use License</Title>
            <Paragraph className="text-gray-600 mb-4">
              Permission is granted to temporarily use FileMaster for personal and commercial use. 
              This license shall automatically terminate if you violate any of these restrictions.
            </Paragraph>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Use the service in compliance with applicable laws</li>
              <li>Not attempt to interfere with or disrupt the service</li>
              <li>Not upload malicious files or content</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </Card>

          <Card className="card-modern border border-gray-200">
            <Title level={4} className="text-primary-600 mb-4">File Processing</Title>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>You retain ownership of all files you upload</li>
              <li>Files are automatically deleted after processing</li>
              <li>We do not claim any rights to your content</li>
              <li>You are responsible for ensuring you have rights to process uploaded files</li>
            </ul>
          </Card>

          <Card className="card-modern border border-gray-200">
            <Title level={4} className="text-primary-600 mb-4">Service Availability</Title>
            <Paragraph className="text-gray-600">
              We strive to maintain high availability but cannot guarantee uninterrupted service. 
              We reserve the right to modify or discontinue the service with or without notice.
            </Paragraph>
          </Card>

          <Card className="card-modern border border-gray-200">
            <Title level={4} className="text-primary-600 mb-4">Limitation of Liability</Title>
            <Paragraph className="text-gray-600">
              FileMaster shall not be liable for any damages arising from the use or inability 
              to use the service, including but not limited to direct, indirect, incidental, 
              punitive, and consequential damages.
            </Paragraph>
          </Card>

          <Card className="card-modern border border-gray-200">
            <Title level={4} className="text-primary-600 mb-4">Contact Information</Title>
            <Paragraph className="text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </Paragraph>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text strong className="text-gray-900">FileMaster Support</Text><br />
              <Text className="text-gray-600">Email: legal@filemaster.com</Text><br />
              <Text className="text-gray-600">Phone: +1 (555) 123-4567</Text>
            </div>
          </Card>
        </div>

  }];


  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center mb-12">
            <Title level={1} className="text-gray-900 mb-2">Help Center</Title>
            <Paragraph className="text-base text-gray-600 max-w-2xl mx-auto">
              Find answers to your questions and get the help you need
            </Paragraph>
          </div>

          <Tabs
            defaultActiveKey={initialTab}
            items={tabItems}
            size="large"
            className="help-center-tabs bg-white rounded-2xl shadow-sm p-6"
            tabBarStyle={{ marginBottom: '24px' }} />
          
        </div>
      </div>
    </MainLayout>);

};

export default HelpCenterPage;