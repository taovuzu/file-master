import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Button, Card, Carousel, Statistic, Divider } from 'antd';
import { 
  FileText, 
  Users, 
  Clock, 
  Shield, 
  Zap, 
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Lock
} from 'lucide-react';

import MainLayout from '@/layout/MainLayout';
import ToolCard, { toolCardUtils } from '@/components/ToolCard';
import FileUploadZone from '@/components/FileUploadZone';
import { PDF_OPERATIONS, ROUTES } from '@/utils/constants';
import { usePageTracking } from '@/utils/analytics';
import { logUserAction } from '@/utils/logger';

const { Title, Paragraph } = Typography;

/**
 * Modern HomePage component for the I Love PDF clone
 * Features hero section, tool showcase, statistics, and quick actions
 */
const HomePage = () => {
  const [featuredTools, setFeaturedTools] = useState([]);
  const [allTools, setAllTools] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    files: 0,
    countries: 0,
  });

  // Track page view
  usePageTracking('home');

  useEffect(() => {
    // Initialize tools
    setFeaturedTools(toolCardUtils.getFeaturedTools());
    setAllTools(toolCardUtils.getAllTools());

    // Animate statistics
    animateStats();
  }, []);

  /**
   * Animate statistics with counting effect
   */
  const animateStats = () => {
    const targetStats = {
      users: 5000000,
      files: 15000000,
      countries: 195,
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        users: Math.floor(targetStats.users * progress),
        files: Math.floor(targetStats.files * progress),
        countries: Math.floor(targetStats.countries * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);
  };

  /**
   * Handle tool selection
   * @param {string} tool - Selected tool
   */
  const handleToolSelect = (tool) => {
    logUserAction('home_tool_selected', { tool });
    // Navigation will be handled by ToolCard component
  };

  /**
   * Handle file upload
   * @param {File[]} files - Uploaded files
   */
  const handleFileUpload = (files) => {
    logUserAction('home_file_upload', { 
      count: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
    });
    // Navigate to merge tool with files
    // This would typically open a modal or navigate to the tool
  };

  /**
   * Handle quick action
   * @param {string} action - Action type
   */
  const handleQuickAction = (action) => {
    logUserAction('home_quick_action', { action });
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-br from-blue-50 to-indigo-100 py-16 -mt-6">
        <div className="container mx-auto px-4">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} lg={12}>
              <div className="hero-content">
                <Title level={1} className="hero-title mb-6">
                  Professional PDF Tools
                  <span className="block text-blue-600">Made Simple</span>
                </Title>
                
                <Paragraph className="hero-description text-lg text-gray-600 mb-8">
                  Transform your PDFs with our comprehensive suite of tools. 
                  Merge, split, compress, and convert PDFs with ease. 
                  Trusted by millions of users worldwide.
                </Paragraph>

                <div className="hero-actions space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<FileText />}
                    onClick={() => handleQuickAction('upload')}
                    className="w-full sm:w-auto"
                  >
                    Upload PDF Files
                  </Button>
                  
                  <Button 
                    size="large"
                    icon={<ArrowRight />}
                    onClick={() => handleQuickAction('explore')}
                    className="w-full sm:w-auto"
                  >
                    Explore All Tools
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="trust-indicators mt-8 flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="text-green-500" size={20} />
                    <span className="text-sm text-gray-600">Secure & Private</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="text-blue-500" size={20} />
                    <span className="text-sm text-gray-600">Fast Processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="text-purple-500" size={20} />
                    <span className="text-sm text-gray-600">No Registration</span>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="hero-visual">
                <FileUploadZone
                  onFilesSelected={handleFileUpload}
                  multiple={true}
                  maxFiles={5}
                  className="max-w-md mx-auto"
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section py-16 bg-white">
        <div className="container mx-auto px-4">
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={8}>
              <Card className="text-center border-0 shadow-sm">
                <Statistic
                  title="Active Users"
                  value={stats.users}
                  prefix={<Users className="text-blue-500" />}
                  suffix="+"
                  valueStyle={{ color: '#3b82f6' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center border-0 shadow-sm">
                <Statistic
                  title="Files Processed"
                  value={stats.files}
                  prefix={<FileText className="text-green-500" />}
                  suffix="+"
                  valueStyle={{ color: '#10b981' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="text-center border-0 shadow-sm">
                <Statistic
                  title="Countries Served"
                  value={stats.countries}
                  prefix={<Globe className="text-purple-500" />}
                  valueStyle={{ color: '#8b5cf6' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="featured-tools py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Title level={2} className="mb-4">
              Most Popular Tools
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our most trusted and widely-used PDF tools, designed to handle your most common PDF tasks efficiently.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]} justify="center">
            {featuredTools.slice(0, 4).map((tool) => (
              <Col xs={24} sm={12} lg={6} key={tool.key}>
                <ToolCard
                  tool={tool.key}
                  featured={true}
                  onClick={handleToolSelect}
                />
              </Col>
            ))}
          </Row>

          <div className="text-center mt-12">
            <Button 
              type="primary" 
              size="large"
              onClick={() => handleQuickAction('view_all_tools')}
            >
              View All Tools
            </Button>
          </div>
        </div>
      </section>

      {/* All Tools Grid */}
      <section className="all-tools py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Title level={2} className="mb-4">
              Complete PDF Toolkit
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to work with PDFs. From basic operations to advanced features, we've got you covered.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {allTools.map((tool) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={tool.key}>
                <ToolCard
                  tool={tool.key}
                  compact={true}
                  onClick={handleToolSelect}
                />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section className="features py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
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

      {/* CTA Section */}
      <section className="cta-section py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <Title level={2} className="text-white mb-4">
            Ready to Transform Your PDFs?
          </Title>
          <Paragraph className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join millions of users who trust our platform for their PDF needs. 
            Start processing your documents today - no registration required.
          </Paragraph>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button 
              type="primary" 
              size="large"
              ghost
              icon={<FileText />}
              onClick={() => handleQuickAction('get_started')}
            >
              Get Started Now
            </Button>
            
            <Button 
              size="large"
              ghost
              icon={<Star />}
              onClick={() => handleQuickAction('learn_more')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
