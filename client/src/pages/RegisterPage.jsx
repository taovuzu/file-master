import React, { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/layout/AuthLayout';
import AuthForm from '@/components/AuthForm';
import { useDispatch } from 'react-redux';
import { register } from '@/redux/auth/actions';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const result = await dispatch(register(values));
      if (result.success) {
        message.success('Registration successful! Please check your email to verify your account.');
        navigate('/login');
      } else {
        message.error(result.message || 'Registration failed');
      }
    } catch (error) {
      message.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to get started with FileMaster"
    >
      <AuthForm
        type="register"
        onFinish={handleRegister}
        loading={loading}
      />
    </AuthLayout>
  );
};

export default RegisterPage;
