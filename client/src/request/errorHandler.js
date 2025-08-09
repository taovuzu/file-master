import { notification } from 'antd';
import codeMessage from './codeMessage';

const notifyError = (title, description, duration = 15, maxCount = 1) => {
  notification.config({ duration, maxCount });
  notification.error({ message: title, description });
};

const errorHandler = (error) => {
  if (!navigator.onLine) {
    notifyError(
      'No internet connection',
      'Cannot connect to the Internet, Check your internet network'
    );
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Check your internet network',
    };
  }

  const { response } = error || {};

  if (!response) {
    notifyError(
      'Problem connecting to server',
      'Cannot connect to the server, Contact your Account administrator',
      20
    );
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Contact your Account administrator',
    };
  }

  if (response?.data?.jwtExpired) {
    const result = window.localStorage.getItem('auth');
    const isLogoutData = window.localStorage.getItem('isLogout');
    const { isLogout } = (isLogoutData && JSON.parse(isLogoutData)) || {};
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('isLogout');

    if (result || isLogout) {
      window.location.href = '/logout';
    }
  }

  if (response?.status) {
    const errorText =
      response.data?.message || codeMessage[response.status] || 'Unexpected error';
    notifyError(`Request error ${response.status}`, errorText, 20, 2);

    if (response?.data?.error?.name === 'JsonWebTokenError') {
      window.localStorage.removeItem('auth');
      window.localStorage.removeItem('isLogout');
      window.location.href = '/logout';
    }
    return response.data;
  }

  notifyError(
    'Problem connecting to server',
    'Cannot connect to the server, Try again later'
  );
  return {
    success: false,
    result: null,
    message: 'Cannot connect to the server, Contact your Account administrator',
  };
};

export default errorHandler;
