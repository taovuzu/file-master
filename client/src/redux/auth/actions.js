import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '@/auth';
import { request } from '@/request';

const buildAuthState = (user) => ({
  current: user,
  isLoggedIn: true,
  isLoading: false,
  isSuccess: true
});

export const clearEmailRegistrationStep = createAsyncThunk(
  'auth/clearEmailRegistrationStep',
  async () => {
    return null;
  }
);

export const registerEmail = createAsyncThunk(
  'auth/registerEmail',
  async ({ email }, { rejectWithValue }) => {
    const data = await authService.registerEmail({ email });

    if (data.success === true) {
      return data.result;
    }
    return rejectWithValue(data?.error || 'Email registration failed');
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ registerData }, { rejectWithValue }) => {
    const data = await authService.registerUser({ registerData });

    if (data.success === true) {
      const authState = buildAuthState(data.result);
      window.localStorage.setItem('auth', JSON.stringify(authState));
      window.localStorage.removeItem('isLogout');
      return data.result;
    }
    return rejectWithValue(data?.error || 'User registration failed');
  }
);

export const verifyEmailByLink = createAsyncThunk(
  'auth/verifyEmailByLink',
  async ({ email, unHashedToken }, { rejectWithValue }) => {
    const data = await authService.verifyEmailByLink({ email, unHashedToken });

    if (data.success === true) {
      return data.result; // { registrationToken, email }
    }
    return rejectWithValue(data?.error || 'Email verification failed');
  }
);

export const verifyEmailByOTP = createAsyncThunk(
  'auth/verifyEmailByOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    const data = await authService.verifyEmailByOTP({ email, otp });

    if (data.success === true) {
      return data.result; // { registrationToken }
    }
    return rejectWithValue(data?.error || 'OTP verification failed');
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async ({ email }, { rejectWithValue }) => {
    const data = await authService.resendVerification({ email });

    if (data.success === true) {
      return data.result;
    }
    return rejectWithValue(data?.error || 'Email registration failed');
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ loginData }, { rejectWithValue }) => {
    const data = await authService.login({ loginData });

    if (data.success === true) {
      const authState = buildAuthState(data.result);
      window.localStorage.setItem('auth', JSON.stringify(authState));
      window.localStorage.removeItem('isLogout');
      return data.result;
    }
    return rejectWithValue(data?.error || 'Login failed');
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async ({ email }, { rejectWithValue }) => {
    const data = await authService.requestPasswordReset({ email });

    if (data.success === true) {
      return data.result;
    }
    return rejectWithValue(data?.error || 'Password reset request failed');
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    const data = await authService.refreshAccessToken();

    if (data.success === true) {
      return data.result;
    }
    return rejectWithValue(data?.error || 'Token refresh failed');
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    const data = await authService.getCurrentUser();

    if (data.success === true) {
      const authState = buildAuthState(data.result);
      window.localStorage.setItem('auth', JSON.stringify(authState));
      return data.result;
    }
    return rejectWithValue(data?.error || 'Failed to get current user');
  }
);

export const changeCurrentPassword = createAsyncThunk(
  'auth/changeCurrentPassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    const data = await authService.changeCurrentPassword({ oldPassword, newPassword });

    if (data.success === true) {
      return data.result;
    }
    return rejectWithValue(data?.error || 'Password change failed');
  }
);

export const resetPasswordWithToken = createAsyncThunk(
  "auth/resetPasswordWithToken",
  async ({ email, unHashedToken, newPassword }, { rejectWithValue }) => {
    try {
      const data = await authService.resetPasswordWithToken({
        email,
        unHashedToken,
        newPassword
      });

      if (data.success === true) {
        return data.result;
      }

      return rejectWithValue(data?.error || "Password reset failed");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.googleLogin();

      if (data.success === true) {
        const authState = buildAuthState(data.result);
        window.localStorage.setItem('auth', JSON.stringify(authState));
        window.localStorage.removeItem('isLogout');
        return data.result;
      }

      return rejectWithValue(data?.error || 'Google login failed');
    } catch (error) {
      return rejectWithValue(error?.message || 'Google login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    const authRaw = window.localStorage.getItem('auth');
    const tmpAuth = authRaw ? JSON.parse(authRaw) : null;

    const settingsRaw = window.localStorage.getItem('settings');
    const tmpSettings = settingsRaw ? JSON.parse(settingsRaw) : null;

    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('settings');
    window.localStorage.setItem('isLogout', JSON.stringify({ isLogout: true }));

    const data = await authService.logout();

    if (data.success === false) {
      if (tmpAuth) {
        window.localStorage.setItem('auth', JSON.stringify(tmpAuth));
      }
      if (tmpSettings) {
        window.localStorage.setItem('settings', JSON.stringify(tmpSettings));
      }
      window.localStorage.removeItem('isLogout');
      return rejectWithValue(data?.error || 'Logout failed');
    }

    return data.result;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ entity, jsonData }, { rejectWithValue }) => {
    const data = await request.updateAndUpload({ entity, id: '', jsonData });

    if (data.success === true) {
      const authState = buildAuthState(data.result);
      window.localStorage.setItem('auth', JSON.stringify(authState));
      return data.result;
    }
    return rejectWithValue(data?.error || 'Profile update failed');
  }
);