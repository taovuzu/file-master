import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '@/auth';
import { request } from '@/request';

const buildAuthState = (user) => ({
  current: user,
  isLoggedIn: true,
  isLoading: false,
  isSuccess: true,
});

// Action to clear email registration step
export const clearEmailRegistrationStep = createAsyncThunk(
  'auth/clearEmailRegistrationStep',
  async () => {
    return null; // No async operation needed
  }
);

// Step 1: Register email
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

// Step 2: Complete user registration
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

// Verify email by link
export const verifyEmailByLink = createAsyncThunk(
  'auth/verifyEmailByLink',
  async ({ token }, { rejectWithValue }) => {
    const data = await authService.verifyEmailByLink({ token });

    if (data.success === true) {
      const authState = buildAuthState(data.result);
      window.localStorage.setItem('auth', JSON.stringify(authState));
      window.localStorage.removeItem('isLogout');
      return data.result;
    }
    return rejectWithValue(data?.error || 'Email verification failed');
  }
);

// Verify email by OTP
export const verifyEmailByOTP = createAsyncThunk(
  'auth/verifyEmailByOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    const data = await authService.verifyEmailByOTP({ email, otp });

    if (data.success === true) {
      const authState = buildAuthState(data.result);
      window.localStorage.setItem('auth', JSON.stringify(authState));
      window.localStorage.removeItem('isLogout');
      return data.result;
    }
    return rejectWithValue(data?.error || 'OTP verification failed');
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

// Request password reset
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

// Reset forgotten password
export const resetForgottenPassword = createAsyncThunk(
  'auth/resetForgottenPassword',
  async ({ resetPasswordData }, { rejectWithValue }) => {
    const data = await authService.resetForgottenPassword({ resetPasswordData });

    if (data.success === true) {
      return data.result;
    }
    return rejectWithValue(data?.error || 'Password reset failed');
  }
);

// Refresh access token
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

// Get current user
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

// Change current password
export const changeCurrentPassword = createAsyncThunk(
  'auth/changeCurrentPassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    const data = await authService.changeCurrentPassword({ currentPassword, newPassword });

    if (data.success === true) {
      return data.result;
    }
    return rejectWithValue(data?.error || 'Password change failed');
  }
);

// Google OAuth login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      // assume authService.googleLogin accepts a token or code from Google SDK
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

// Legacy methods for backward compatibility
export const register = createAsyncThunk(
  'auth/register',
  async ({ registerData }, { rejectWithValue }) => {
    const data = await authService.registerUser({ registerData });

    if (data.success === true) {
      const authState = buildAuthState(data.result);
      window.localStorage.setItem('auth', JSON.stringify(authState));
      window.localStorage.removeItem('isLogout');
      return data.result;
    }
    return rejectWithValue(data?.error || 'Registration failed');
  }
);

export const verify = createAsyncThunk(
  'auth/verify',
  async ({ userId, emailToken }, { rejectWithValue }) => {
    const data = await authService.verify({ userId, emailToken });

    if (data.success === true) {
      const authState = buildAuthState(data.result);
      window.localStorage.setItem('auth', JSON.stringify(authState));
      window.localStorage.removeItem('isLogout');
      return data.result;
    }
    return rejectWithValue(data?.error || 'Verification failed');
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ resetPasswordData }, { rejectWithValue }) => {
    const data = await authService.resetPassword({ resetPasswordData });

    if (data.success === true) {
      const authState = buildAuthState(data.result);
      window.localStorage.setItem('auth', JSON.stringify(authState));
      window.localStorage.removeItem('isLogout');
      return data.result;
    }
    return rejectWithValue(data?.error || 'Password reset failed');
  }
);
