import React, { useEffect } from 'react';
import { message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/auth/actions';
import AuthLayout from '@/layout/AuthLayout';

const LogoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await dispatch(logout());
        message.success('Logged out successfully!');
        navigate('/login');
      } catch (error) {
        message.error('An error occurred during logout');
        navigate('/login');
      }
    };

    performLogout();
  }, [dispatch, navigate]);

  return (
    <AuthLayout
      title="Logging Out"
      subtitle="Please wait while we log you out...">
      
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Logging you out...</p>
      </div>
    </AuthLayout>);

};

export default LogoutPage;