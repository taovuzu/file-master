import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AuthLayout from '@/layout/AuthLayout';
import AuthForm from '@/forms/AuthForm';
import { resetForgottenPassword } from '@/redux/auth/actions';

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      message.error('Invalid reset link. Please request a new one.');
      navigate('/forgot-password');
      return;
    }
    
    // TODO: Validate token with backend
    // validateResetToken(token).then(valid => setTokenValid(valid));
    setTokenValid(true);
  }, [searchParams, navigate]);

  const handleResetPassword = async (values) => {
    if (!tokenValid) {
      message.error('Invalid reset token');
      return;
    }

    setLoading(true);
    try {
      const token = searchParams.get('token');
      const resetPasswordData = {
        token: token,
        password: values.password,
        confirmPassword: values.confirmPassword
      };
      
      const result = await dispatch(resetForgottenPassword({ resetPasswordData }));
      if (result.meta.requestStatus === 'fulfilled') {
        message.success('Password has been reset successfully!');
        navigate('/login');
      } else {
        message.error('Failed to reset password. Please try again.');
      }
    } catch (error) {
      message.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="Please request a new password reset link"
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>This reset link is invalid or has expired.</p>
          <a href="/forgot-password">Request New Reset Link</a>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password"
    >
      <AuthForm
        type="resetPassword"
        onFinish={handleResetPassword}
        loading={loading}
      />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
