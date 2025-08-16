import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import AuthForm from '@/forms/AuthForm';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (values) => {
    setLoading(true);
    try {
      // TODO: Implement forgot password API call
      // const result = await forgotPasswordService(values.email);
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Password reset link has been sent to your email!');
      navigate('/login');
    } catch (error) {
      message.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive a password reset link"
    >
      <AuthForm
        type="forgetPassword"
        onFinish={handleForgotPassword}
        loading={loading}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
