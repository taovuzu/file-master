import { API_BASE_URL } from '@/config/serverApiConfig';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid retry/refresh loop if the 401 came from the refresh endpoint itself
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
    // Avoid logging auth payloads
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

export const resendVerification = () =>
sendAuthRequest(
  'post',
  'users/resend-verification',
  {},
  { notifyOnSuccess: false, notifyOnFailed: false }
);

export const verifyEmailByLink = ({ token }) =>
sendAuthRequest(
  'get',
  `users/verify-email-link?token=${token}`,
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
  window.location.href = "http://localhost:8080/api/v1/users/google";
};