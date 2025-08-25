import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from '@/layout/MainLayout';
import { Card, Typography, Button, Row, Col, Badge, message, Modal, Spin } from 'antd';
import { CrownOutlined, CheckOutlined, StarOutlined, ZapOutlined } from '@ant-design/icons';
import { getSubscriptionPlans, createSubscription, processRazorpayPayment } from '@/redux/subscription';
import { selectCurrentUser } from '@/redux/auth/selectors';
import { selectSubscriptionPlans, selectSubscriptionLoading, selectSubscriptionError } from '@/redux/subscription/selectors';

const { Title, Paragraph, Text } = Typography;

const plans = [
  {
    key: 'FREE',
    name: 'Free',
    price: '₹0',
    period: '/mo',
    cta: 'Current Plan',
    features: [
      'All tools available',
      'No login required',
      'Daily limit: 10 operations',
      'Monthly limit: 100 operations',
      'Max file size: 25MB',
      'Basic support'
    ],
    highlight: false,
    popular: false
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: '₹999',
    period: '/mo',
    cta: 'Upgrade to Pro',
    features: [
      'All Free features',
      'Daily limit: 500 operations',
      'Monthly limit: 5,000 operations',
      'Max file size: 1GB',
      'Priority processing',
      'Email support',
      'Advanced tools'
    ],
    highlight: true,
    popular: true
  },
  {
    key: 'BUSINESS',
    name: 'Business',
    price: '₹2,999',
    period: '/mo',
    cta: 'Upgrade to Business',
    features: [
      'All Pro features',
      'Daily limit: 1,000 operations',
      'Monthly limit: 10,000 operations',
      'Max file size: 2GB',
      'Priority processing',
      'Priority support',
      'Team management',
      'Custom integrations'
    ],
    highlight: false,
    popular: false
  }
];

const PricingPage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const subscriptionPlans = useSelector(selectSubscriptionPlans);
  const isLoading = useSelector(selectSubscriptionLoading);
  const error = useSelector(selectSubscriptionError);

  useEffect(() => {
    if (!subscriptionPlans.length) {
      dispatch(getSubscriptionPlans());
    }
  }, [dispatch, subscriptionPlans.length]);

  const handleUpgrade = async (plan) => {
    if (!currentUser) {
      message.warning('Please login to upgrade your plan');
      return;
    }

    if (currentUser.plan === plan.key) {
      message.info('You are already on this plan');
      return;
    }

    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      // Create subscription
      const subscriptionResult = await dispatch(createSubscription({ 
        planType: selectedPlan.key 
      })).unwrap();

      if (subscriptionResult) {
        // Process payment
        await dispatch(processRazorpayPayment({
          subscriptionData: subscriptionResult,
          userData: currentUser
        })).unwrap();

        message.success(`Successfully upgraded to ${selectedPlan.name} plan!`);
        setShowUpgradeModal(false);
        setSelectedPlan(null);
        
        // Refresh user data
        window.location.reload();
      }
    } catch (error) {
      message.error(error || 'Failed to upgrade plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = () => {
    return currentUser?.plan || 'FREE';
  };

  const isCurrentPlan = (planKey) => {
    return getCurrentPlan() === planKey;
  };

  const canUpgrade = (planKey) => {
    const currentPlan = getCurrentPlan();
    const planOrder = { 'FREE': 0, 'PRO': 1, 'BUSINESS': 2 };
    return planOrder[planKey] > planOrder[currentPlan];
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center mb-12">
            <Title level={1} className="text-gray-900 mb-2">Choose Your Plan</Title>
            <Paragraph className="text-base text-gray-600 max-w-2xl mx-auto">
              Start free and upgrade when you need more power. All plans include access to all tools.
            </Paragraph>
            {currentUser && (
              <div className="mt-4">
                <Badge 
                  status="processing" 
                  text={`Current Plan: ${currentUser.plan || 'FREE'}`} 
                  className="text-lg font-medium"
                />
              </div>
            )}
          </div>

          <Row gutter={[24, 24]}>
            {plans.map((plan) => (
              <Col xs={24} md={8} key={plan.key}>
                <Card 
                  className={`rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg ${
                    plan.highlight ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-200'
                  } ${isCurrentPlan(plan.key) ? 'ring-2 ring-green-300 border-green-300' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge 
                        count="MOST POPULAR" 
                        className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium"
                      />
                    </div>
                  )}
                  
                  {isCurrentPlan(plan.key) && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge 
                        count="CURRENT PLAN" 
                        className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium"
                      />
                    </div>
                  )}

                  <div className="text-center relative">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {plan.key === 'PRO' && <CrownOutlined className="text-primary-600 text-xl" />}
                      {plan.key === 'BUSINESS' && <StarOutlined className="text-yellow-600 text-xl" />}
                      <Text className="uppercase tracking-wide text-gray-500 font-medium">
                        {plan.name}
                      </Text>
                    </div>
                    
                    <div className="mt-2 mb-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500">{plan.period}</span>
                    </div>
                    
                    <ul className="text-left space-y-3 mb-6">
                      {plan.features.map((feat, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-2">
                          <CheckOutlined className="text-green-500 mt-1 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      type={plan.highlight ? 'primary' : 'default'} 
                      size="large" 
                      className={`w-full ${
                        isCurrentPlan(plan.key) 
                          ? 'bg-green-600 border-green-600 text-white hover:bg-green-700' 
                          : ''
                      }`}
                      disabled={isCurrentPlan(plan.key)}
                      onClick={() => handleUpgrade(plan)}
                    >
                      {isCurrentPlan(plan.key) ? 'Current Plan' : plan.cta}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Upgrade Modal */}
          <Modal
            title={`Upgrade to ${selectedPlan?.name}`}
            open={showUpgradeModal}
            onOk={confirmUpgrade}
            onCancel={() => setShowUpgradeModal(false)}
            confirmLoading={loading}
            okText="Proceed to Payment"
            cancelText="Cancel"
            width={500}
          >
            {selectedPlan && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Plan Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-medium">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">{selectedPlan.price}{selectedPlan.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing:</span>
                      <span className="font-medium">Monthly</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">What you'll get:</h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    {selectedPlan.features.slice(1).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckOutlined className="text-blue-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>• You can cancel your subscription at any time</p>
                  <p>• Payment will be processed securely via Razorpay</p>
                  <p>• Your subscription will start immediately after payment</p>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;