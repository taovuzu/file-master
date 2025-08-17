import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AuthLayout from '@/layout/AuthLayout';
import AuthForm from '@/forms/AuthForm';
import { requestPasswordReset } from '@/redux/auth/actions';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleForgotPassword = async (values) => {
    setLoading(true);
    try {
      const result = await dispatch(requestPasswordReset({ email: values.email }));
      if (result.meta.requestStatus === 'fulfilled') {
        message.success('Password reset link has been sent to your email!');
        navigate('/login');
      } else {
        message.error('Failed to send reset link. Please try again.');
      }
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
