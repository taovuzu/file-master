import { notifyError } from '@/utils/notify';
import codeMessage from './codeMessage';

const makeErrorResult = (message) => ({
  success: false,
  result: null,
  message
});

const clearAuth = () => {
  window.localStorage.removeItem('auth');
  window.localStorage.removeItem('isLogout');
};

const errorHandler = (error) => {
  if (!navigator.onLine) {
    notifyError('No internet connection', 'network');
    return makeErrorResult('Cannot connect to the server, Check your internet network');
  }

  const { response } = error || {};

  if (!response) {
    notifyError('Server connection failed', 'server');
    return makeErrorResult('Cannot connect to the server, Contact your Account administrator');
  }

  if (response?.data?.jwtExpired || response?.data?.message === "TokenExpiredError") {
    clearAuth();

    const result = window.localStorage.getItem("auth");
    const isLogoutData = window.localStorage.getItem("isLogout");
    const { isLogout } = isLogoutData && JSON.parse(isLogoutData) || {};

    if (result || isLogout) {
      window.location.href = "/logout";
    }
  }

  if (response?.status) {
    const errorText = response.data?.message || codeMessage[response.status] || 'Unexpected error';
    notifyError(errorText, `error_${response.status}`);

    if (response?.data?.message === 'JsonWebTokenError') {
      clearAuth();
    }
    return response.data;
  }

  notifyError('Server connection failed', 'server');
  return makeErrorResult('Cannot connect to the server, Try again later');
};

export default errorHandler;