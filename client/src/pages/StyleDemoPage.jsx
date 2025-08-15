import React, { useState } from 'react';
import {
  FileText,
  ArrowRight,
  Award,
  Mail,
  User,
  Search
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import FileUploadZone from '@/components/FileUploadZone';
import { Button, Input, Form } from 'antd';
import Header from '@/components/Header';

const StyleDemoPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    search: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tools = ['merge', 'split', 'compress', 'protect', 'unlock', 'rotate', 'watermark', 'convert'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Style Demo - iLovePDF Clone
          </h1>
          <p className="text-xl text-gray-600">
            Showcasing the improved modern styling with Tailwind CSS and Ant Design
          </p>
        </div>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Button Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Primary Buttons</h3>
              <Button type="primary" size="small">Small</Button>
              <Button type="primary" size="middle">Medium</Button>
              <Button type="primary" size="large">Large</Button>
              <Button 
                type="primary" 
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Gradient
              </Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Secondary Buttons</h3>
              <Button type="default" size="small">Small</Button>
              <Button type="default" size="middle">Medium</Button>
              <Button type="default" size="large">Large</Button>
              <Button type="default" ghost>Outline</Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Status Buttons</h3>
              <Button type="primary" style={{ backgroundColor: '#52c41a' }}>Success</Button>
              <Button type="primary" style={{ backgroundColor: '#faad14' }}>Warning</Button>
              <Button type="primary" danger>Error</Button>
              <Button type="text">Ghost</Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">With Icons</h3>
              <Button type="primary" icon={<FileText className="w-4 h-4" />}>
                With Icon
              </Button>
              <Button type="primary" icon={<ArrowRight className="w-4 h-4" />}>
                With Right Icon
              </Button>
              <Button type="primary" loading>Loading</Button>
              <Button type="primary" disabled>Disabled</Button>
            </div>
          </div>
        </section>

        {/* Input Fields Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Input Fields</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Basic Inputs</h3>
              <Form.Item label="Email Address" help="We'll never share your email">
                <Input
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  prefix={<Mail className="w-4 h-4" />}
                  size="large"
                />
              </Form.Item>
              <Form.Item label="Password">
                <Input.Password
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  prefix={<User className="w-4 h-4" />}
                  size="large"
                />
              </Form.Item>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Search Input</h3>
              <Input
                placeholder="Search PDF tools..."
                value={formData.search}
                onChange={(e) => handleInputChange('search', e.target.value)}
                prefix={<Search className="w-4 h-4" />}
                size="large"
              />
              <Form.Item label="Success Input" help="Great! This looks good">
                <Input
                  placeholder="This is a success input"
                  status="success"
                  size="large"
                />
              </Form.Item>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Error States</h3>
              <Form.Item label="Error Input" help="This field is required" validateStatus="error">
                <Input
                  placeholder="This has an error"
                  size="large"
                />
              </Form.Item>
              <Form.Item label="Required Field" required>
                <Input
                  placeholder="This field is required"
                  size="large"
                />
              </Form.Item>
            </div>
          </div>
        </section>

        {/* Tool Cards Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Tool Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {tools.slice(0, 4).map((tool, index) => (
              <ToolCard 
                key={tool} 
                tool={tool} 
                featured={index === 0}
              />
            ))}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Compact Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <ToolCard 
                key={tool} 
                tool={tool} 
                compact={true}
              />
            ))}
          </div>
        </section>

        {/* File Upload Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">File Upload Zone</h2>
          <div className="max-w-2xl mx-auto">
            <FileUploadZone 
              multiple={true}
              maxFiles={3}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Features Grid</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Secure & Private',
                description: 'Your files are encrypted and automatically deleted after processing'
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Lightning Fast',
                description: 'Process your PDFs in seconds with our optimized algorithms'
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Works Everywhere',
                description: 'No installation needed. Works on any device with a web browser'
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Trusted by Millions',
                description: 'Join millions of users who trust us with their documents'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '50M+', label: 'Files Processed' },
              { number: '2M+', label: 'Happy Users' },
              { number: '99.9%', label: 'Uptime' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-soft">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your PDFs?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join millions of users who trust FileMaster for their PDF needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                type="default" 
                size="large"
                icon={<FileText className="w-5 h-5" />}
                className="bg-white text-primary-600 hover:bg-gray-50"
              >
                Start Processing Now
              </Button>
              <Button 
                type="default" 
                size="large"
                icon={<ArrowRight className="w-5 h-5" />}
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StyleDemoPage;
