import { createSlice } from '@reduxjs/toolkit';
import {
  login,
  register,
  verify,
  resetPassword,
  logout,
  updateProfile,
  registerEmail,
  registerUser,
  verifyEmailByLink,
  verifyEmailByOTP,
  requestPasswordReset,
  resetForgottenPassword,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  googleLogin,
  clearEmailRegistrationStep,
} from './actions';

const INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
  emailRegistrationStep: false, 
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

    builder.addCase(clearEmailRegistrationStep.fulfilled, (state) => {
      state.emailRegistrationStep = false;
    });

    builder
      .addCase(registerEmail.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(registerEmail.fulfilled, (state) => {
        state.emailRegistrationStep = true;
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(registerEmail.rejected, (state) => {
        state.emailRegistrationStep = false;
        state.isLoading = false;
        state.isSuccess = false;
      });

    // USER REGISTRATION STEP 2
    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, (state) => {
        state.current = null;
        state.isLoggedIn = false;
        state.isLoading = false;
        state.isSuccess = true;
        state.emailRegistrationStep = false;
      })
      .addCase(registerUser.rejected, (state) => {
        state.emailRegistrationStep = false;
        return INITIAL_STATE;
      });

    // VERIFY EMAIL BY LINK
    builder
      .addCase(verifyEmailByLink.pending, handlePending)
      .addCase(verifyEmailByLink.fulfilled, handleFulfilled)
      .addCase(verifyEmailByLink.rejected, handleRejected);

    // VERIFY EMAIL BY OTP
    builder
      .addCase(verifyEmailByOTP.pending, handlePending)
      .addCase(verifyEmailByOTP.fulfilled, handleFulfilled)
      .addCase(verifyEmailByOTP.rejected, handleRejected);

    // REQUEST PASSWORD RESET
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(requestPasswordReset.rejected, (state) => {
        state.isLoading = false;
        state.isSuccess = false;
      });

    // RESET FORGOTTEN PASSWORD
    builder
      .addCase(resetForgottenPassword.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(resetForgottenPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(resetForgottenPassword.rejected, (state) => {
        state.isLoading = false;
        state.isSuccess = false;
      });

    // REFRESH ACCESS TOKEN
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isLoading = false;
      });

    // GET CURRENT USER
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.current = action.payload;
        state.isLoggedIn = true;
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
      });

    // CHANGE CURRENT PASSWORD
    builder
      .addCase(changeCurrentPassword.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
      })
      .addCase(changeCurrentPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(changeCurrentPassword.rejected, (state) => {
        state.isLoading = false;
        state.isSuccess = false;
      });

    // GOOGLE LOGIN
    builder
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(googleLogin.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(googleLogin.rejected, (state) => {
        state.isLoading = false;
      });

    // LOGIN
    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected);

    // REGISTER (legacy)
    builder
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state) => {
        state.current = null;
        state.isLoggedIn = false;
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(register.rejected, handleRejected);

    // VERIFY (legacy)
    builder
      .addCase(verify.pending, handlePending)
      .addCase(verify.fulfilled, handleFulfilled)
      .addCase(verify.rejected, handleRejected);

    // RESET PASSWORD (legacy)
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
