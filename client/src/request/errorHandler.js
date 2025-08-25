import { notification } from 'antd';
import codeMessage from './codeMessage';

const notifyError = (title, description, duration = 15, maxCount = 1) => {
  notification.config({ duration, maxCount });
  notification.error({
    message: title,
    description,
    duration,
    placement: 'bottomRight',
    key: Date.now()
  });
};

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
  console.log(error);

  if (!navigator.onLine) {
    notifyError('No internet connection', 'Check your internet network');
    return makeErrorResult('Cannot connect to the server, Check your internet network');
  }

  const { response } = error || {};

  if (!response) {
    notifyError('Problem connecting to server', 'Contact your Account administrator', 20);
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
    const errorText =
    response.data?.message || codeMessage[response.status] || 'Unexpected error';
    notifyError(`Request error ${response.status}`, errorText, 20, 2);

    if (response?.data?.message === 'JsonWebTokenError') {
      clearAuth();
    }
    return response.data;
  }

  notifyError('Problem connecting to server', 'Try again later');
  return makeErrorResult('Cannot connect to the server, Try again later');
};

export default errorHandler;