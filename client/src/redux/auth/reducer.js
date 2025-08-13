import { createSlice } from '@reduxjs/toolkit';
import {
  login,
  register,
  verify,
  resetPassword,
  logout,
  updateProfile,
} from './actions';

const INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoggedIn = false;
      state.isLoading = true;
      state.isSuccess = false;
    };

    const handleFulfilled = (state, action) => {
      state.current = action.payload;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.isSuccess = true;
    };

    const handleRejected = (state) => {
      return INITIAL_STATE;
    };

    // LOGIN
    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected);

    // REGISTER
    builder
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state) => {
        state.current = null;
        state.isLoggedIn = false;
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(register.rejected, handleRejected);

    // VERIFY
    builder
      .addCase(verify.pending, handlePending)
      .addCase(verify.fulfilled, handleFulfilled)
      .addCase(verify.rejected, handleRejected);

    // RESET PASSWORD
    builder
      .addCase(resetPassword.pending, handlePending)
      .addCase(resetPassword.fulfilled, handleFulfilled)
      .addCase(resetPassword.rejected, handleRejected);

    // LOGOUT
    builder
      .addCase(logout.pending, handlePending)
      .addCase(logout.fulfilled, () => INITIAL_STATE)
      .addCase(logout.rejected, (state, action) => {
        state.current = action.payload;
        state.isLoggedIn = true;
        state.isLoading = false;
        state.isSuccess = true;
      });

    // UPDATE PROFILE
    builder
      .addCase(updateProfile.pending, handlePending)
      .addCase(updateProfile.fulfilled, handleFulfilled)
      .addCase(updateProfile.rejected, handleRejected);
  },
});

export default authSlice.reducer;
