import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { login, register, logout, resetPassword } from '@/redux/auth/actions';
import { selectAuthState } from '@/redux/auth/selectors';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(selectAuthState);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const result = await dispatch(login(credentials));
      if (result.success) {
        message.success('Login successful!');
        navigate('/');
        return { success: true };
      } else {
        message.error(result.message || 'Login failed');
        return { success: false, message: result.message };
      }
    } catch (error) {
      message.error('An unexpected error occurred');
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    try {
      const result = await dispatch(register(userData));
      if (result.success) {
        message.success('Registration successful! Please check your email to verify your account.');
        navigate('/login');
        return { success: true };
      } else {
        message.error(result.message || 'Registration failed');
        return { success: false, message: result.message };
      }
    } catch (error) {
      message.error('An unexpected error occurred');
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(logout());
      message.success('Logged out successfully');
      navigate('/login');
      return { success: true };
    } catch (error) {
      message.error('Logout failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  const handleResetPassword = useCallback(async (resetData) => {
    setLoading(true);
    try {
      const result = await dispatch(resetPassword(resetData));
      if (result.success) {
        message.success('Password reset successful!');
        navigate('/login');
        return { success: true };
      } else {
        message.error(result.message || 'Password reset failed');
        return { success: false, message: result.message };
      }
    } catch (error) {
      message.error('An unexpected error occurred');
      return { success: false, message: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  return {
    user: auth.current,
    isLoggedIn: auth.isLoggedIn,
    isLoading: auth.isLoading || loading,
    isSuccess: auth.isSuccess,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    resetPassword: handleResetPassword,
  };
};

export default useAuth;
