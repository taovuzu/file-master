import React, { useState, useEffect } from 'react';
import { message, Result, Button, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmailByLink } from '@/redux/auth/actions';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const VerifyEmailPage = () => {
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setVerificationStatus('error');
          setLoading(false);
          return;
        }

        const result = await dispatch(verifyEmailByLink({ token }));
        if (result.meta.requestStatus === 'fulfilled') {
          setVerificationStatus('success');
          message.success('Email verified successfully!');
        } else {
          setVerificationStatus('error');
          message.error('Email verification failed. Please try again.');
        }
      } catch (error) {
        setVerificationStatus('error');
        message.error('An unexpected error occurred during verification.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [dispatch, searchParams]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Verifying your email...</p>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <Result
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        title="Email Verified Successfully!"
        subTitle="Your email has been verified. You can now sign in to your account."
        extra={[
          <Button type="primary" key="login" onClick={() => navigate('/login')}>
            Sign In
          </Button>,
          <Button key="home" onClick={() => navigate('/')}>
            Go Home
          </Button>
        ]}
      />
    );
  }

  return (
    <Result
      icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
      title="Email Verification Failed"
      subTitle="The verification link is invalid or has expired. Please request a new verification email."
      extra={[
        <Button type="primary" key="register" onClick={() => navigate('/register')}>
          Register Again
        </Button>,
        <Button key="login" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      ]}
    />
  );
};

export default VerifyEmailPage;
