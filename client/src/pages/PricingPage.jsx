import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { Card, Typography, Button, Row, Col } from 'antd';

const { Title, Paragraph, Text } = Typography;

const plans = [
{
  key: 'free',
  name: 'Free',
  price: '$0',
  period: '/mo',
  cta: 'Start Free',
  features: [
  'All tools available',
  'No login required',
  'Daily limit: 10 operations',
  'Max file size: 25MB'],

  highlight: false
},
{
  key: 'pro',
  name: 'Pro',
  price: '₹299',
  period: '/mo',
  cta: 'Upgrade to Pro',
  features: [
  'Higher daily limits',
  'Priority processing',
  'Max file size: 200MB',
  'Email support'],

  highlight: true
},
{
  key: 'business',
  name: 'Business',
  price: '₹3999',
  period: '/mo',
  cta: 'Contact Sales',
  features: [
  'Team seats',
  'Admin controls',
  'Custom limits',
  'SLA support'],

  highlight: false
}];


const PricingPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center mb-12">
            <Title level={1} className="text-gray-900 mb-2">Pricing</Title>
            <Paragraph className="text-base text-gray-600 max-w-2xl mx-auto">
              Use all tools for free with fair limits. Upgrade when you need more.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {plans.map((plan) =>
            <Col xs={24} md={8} key={plan.key}>
                <Card className={`rounded-2xl shadow-sm border ${plan.highlight ? 'border-primary-300' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <Text className="uppercase tracking-wide text-gray-500">{plan.name}</Text>
                    <div className="mt-2 mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500">{plan.period}</span>
                    </div>
                    <ul className="text-left space-y-2 mb-6">
                      {plan.features.map((feat) =>
                    <li key={feat} className="text-gray-700">• {feat}</li>
                    )}
                    </ul>
                    <Button type={plan.highlight ? 'primary' : 'default'} size="large" className="w-full">
                      {plan.cta}
                    </Button>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </MainLayout>);

};

export default PricingPage;