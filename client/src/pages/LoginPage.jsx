import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import AuthForm from '@/forms/AuthForm';
import { useDispatch } from 'react-redux';
import { login } from '@/redux/auth/actions';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const result = await dispatch(login(values));
      if (result.success) {
        message.success('Login successful!');
        navigate('/');
      } else {
        message.error(result.message || 'Login failed');
      }
    } catch (error) {
      message.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <AuthForm
        type="login"
        onFinish={handleLogin}
        loading={loading}
      />
    </AuthLayout>
  );
};

export default LoginPage;
