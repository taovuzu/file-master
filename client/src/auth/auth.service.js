import { API_BASE_URL } from '@/config/serverApiConfig';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import axios from 'axios';

const sendAuthRequest = async (method, endpoint, data = {}, successOptions) => {
  try {
    console.log(method, API_BASE_URL + endpoint, data);
    let response = await axios({ method, url: API_BASE_URL + endpoint, data, headers: { 'Content-Type': 'application/json' }, withCredentials: true });

    console.log(response);
    if (successOptions) {
      successHandler({ data: response.data, status: response.status }, successOptions);
    }
    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};

// Step 1: Register email first
export const registerEmail = ({ email }) =>
  sendAuthRequest(
    'post',
    'users/register-email',
    { email },
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

// Step 2: Complete user registration
export const registerUser = ({ registerData }) =>
  sendAuthRequest(
    'post',
    'users/register-user',
    registerData,
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

// Verify email by link (GET request)
export const verifyEmailByLink = ({ token }) =>
  sendAuthRequest(
    'get',
    `users/verify-email-link?token=${token}`,
    null,
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

// Verify email by OTP
export const verifyEmailByOTP = ({ email, otp }) =>
  sendAuthRequest(
    'post',
    'users/verify-email-otp',
    { email, otp },
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

export const login = ({ loginData }) =>
  sendAuthRequest(
    'post',
    'users/login',
    loginData,
    { notifyOnSuccess: false, notifyOnFailed: true }
  );

// Request password reset
export const requestPasswordReset = ({ email }) =>
  sendAuthRequest(
    'get',
    `users/request-password-reset?email=${email}`,
    {},
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

// Reset forgotten password
export const resetForgottenPassword = ({ resetPasswordData }) =>
  sendAuthRequest(
    'post',
    'users/reset-forgot-password',
    resetPasswordData,
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

// Refresh access token
export const refreshAccessToken = () =>
  sendAuthRequest(
    'post',
    'users/refreshAccessToken',
    {},
    { notifyOnSuccess: false, notifyOnFailed: true }
  );

export const logout = () =>
  sendAuthRequest(
    'post',
    'users/logout',
    {},
    { notifyOnSuccess: false, notifyOnFailed: true }
  );

// Get current user
export const getCurrentUser = () =>
  sendAuthRequest(
    'get',
    'users/current-user',
    {},
    { notifyOnSuccess: false, notifyOnFailed: true }
  );

// Change current password
export const changeCurrentPassword = ({ currentPassword, newPassword }) =>
  sendAuthRequest(
    'post',
    'users/change-password',
    { currentPassword, newPassword },
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

// Google OAuth
export const googleLogin = () => {
  window.location.href = "http://localhost:8080/api/v1/users/google";
}

// Legacy methods for backward compatibility
export const verify = ({ userId, emailToken }) =>
  sendAuthRequest(
    'get',
    `users/verify/${userId}/${emailToken}`,
    null,
    { notifyOnSuccess: true, notifyOnFailed: true }
  );

export const resetPassword = ({ resetPasswordData }) =>
  sendAuthRequest(
    'post',
    'users/resetpassword',
    resetPasswordData,
    { notifyOnSuccess: true, notifyOnFailed: true }
  );
