import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '@/auth';
import { request } from '@/request';

const buildAuthState = (user) => ({
  current: user,
  isLoggedIn: true,
  isLoading: false,
  isSuccess: true,
});

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

export const register = createAsyncThunk(
  'auth/register',
  async ({ registerData }, { rejectWithValue }) => {
    const data = await authService.register({ registerData });

    if (data.success === true) {
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
