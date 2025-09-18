import { API_BASE_URL } from '@/config/serverApiConfig';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import axios from 'axios';

function getCsrfToken() {
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const [name, value] = part.trim().split('=');
    if (name === 'csrf-token') return decodeURIComponent(value || '');
  }
  return null;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

axiosInstance.interceptors.request.use((config) => {
  const needsCsrf = ['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase());
  if (needsCsrf) {
    const token = getCsrfToken();
    if (token) config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isRefreshRequest = typeof originalRequest.url === 'string' && originalRequest.url.includes('users/refresh');
      if (isRefreshRequest) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        await axiosInstance.get('users/refresh-access-token');
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const sendAuthRequest = async (method, endpoint, data = {}, successOptions) => {
  try {
    let response = await axiosInstance({ method, url: endpoint, data, headers: { 'Content-Type': 'application/json' }, withCredentials: true });

    if (successOptions) {
      successHandler({ data: response.data, status: response.status }, successOptions);
    }
    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const registerEmail = ({ email }) =>
sendAuthRequest(
  'post',
  'users/register-email',
  { email },
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const registerUser = ({ registerData }) =>
sendAuthRequest(
  'post',
  'users/register-user',
  registerData,
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const resendVerification = ({ email }) =>
sendAuthRequest(
  'post',
  'users/resend-verification',
  { email },
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const verifyEmailByLink = ({ email, unHashedToken }) =>
sendAuthRequest(
  'get',
  `users/verify-email-link?email=${encodeURIComponent(email)}&unHashedToken=${encodeURIComponent(unHashedToken)}&response=json`,
  null,
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const verifyEmailByOTP = ({ email, otp }) =>
sendAuthRequest(
  'post',
  'users/verify-email-otp',
  { email, otp },
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const login = ({ loginData }) =>
sendAuthRequest(
  'post',
  'users/login',
  loginData,
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const requestPasswordReset = ({ email }) =>
sendAuthRequest(
  'post',
  `users/request-password-reset`,
  { email },
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const refreshAccessToken = () =>
sendAuthRequest(
  'post',
  'users/refreshAccessToken',
  {},
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const logout = () =>
sendAuthRequest(
  'post',
  'users/logout',
  {},
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const getCurrentUser = () =>
sendAuthRequest(
  'get',
  'users/current-user',
  {},
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const changeCurrentPassword = ({ oldPassword, newPassword }) =>
sendAuthRequest(
  'post',
  'users/change-password',
  { oldPassword, newPassword },
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const resetPasswordWithToken = ({ email, unHashedToken, newPassword }) =>
sendAuthRequest(
  "post",
  "users/reset-forgot-password",
  { email, unHashedToken, newPassword },
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const googleLogin = () => {
  window.location.href = `${API_BASE_URL}users/google`;
};