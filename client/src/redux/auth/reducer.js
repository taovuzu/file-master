import { createSlice } from '@reduxjs/toolkit';
import {
  login,
  logout,
  updateProfile,
  registerEmail,
  registerUser,
  verifyEmailByLink,
  verifyEmailByOTP,
  resendVerification,
  requestPasswordReset,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  resetPasswordWithToken,
  googleLogin,
  clearEmailRegistrationStep } from
'./actions';

const INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
  emailRegistrationStep: false
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

    builder.
    addCase(registerEmail.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    }).
    addCase(registerEmail.fulfilled, (state) => {
      state.emailRegistrationStep = true;
      state.isLoading = false;
      state.isSuccess = true;
    }).
    addCase(registerEmail.rejected, (state) => {
      state.emailRegistrationStep = false;
      state.isLoading = false;
      state.isSuccess = false;
    });

    builder.
    addCase(registerUser.pending, handlePending).
    addCase(registerUser.fulfilled, (state) => {
      state.current = null;
      state.isLoggedIn = false;
      state.isLoading = false;
      state.isSuccess = true;
      state.emailRegistrationStep = false;
    }).
    addCase(registerUser.rejected, (state) => {
      state.emailRegistrationStep = false;
      return INITIAL_STATE;
    });

    builder.
    addCase(verifyEmailByLink.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    }).
    addCase(verifyEmailByLink.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isLoggedIn = false;
    }).
    addCase(verifyEmailByLink.rejected, (state) => {
      state.isLoading = false;
      state.isSuccess = false;
    });

    builder.
    addCase(verifyEmailByOTP.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    }).
    addCase(verifyEmailByOTP.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isLoggedIn = false;
    }).
    addCase(verifyEmailByOTP.rejected, (state) => {
      return INITIAL_STATE;
    });

    builder.
    addCase(resendVerification.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    }).
    addCase(resendVerification.fulfilled, (state) => {
      state.emailRegistrationStep = true;
      state.isLoading = false;
      state.isSuccess = true;
    }).
    addCase(resendVerification.rejected, (state) => {
      state.isLoading = false;
      state.isSuccess = false;
    });

    builder.
    addCase(requestPasswordReset.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    }).
    addCase(requestPasswordReset.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
    }).
    addCase(requestPasswordReset.rejected, (state) => {
      state.isLoading = false;
      state.isSuccess = false;
    });

    builder.
    addCase(refreshAccessToken.pending, (state) => {
      state.isLoading = true;
    }).
    addCase(refreshAccessToken.fulfilled, (state) => {
      state.isLoading = false;
    }).
    addCase(refreshAccessToken.rejected, (state) => {
      state.isLoading = false;
    });

    builder.
    addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    }).
    addCase(getCurrentUser.fulfilled, (state, action) => {
      state.current = action.payload;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.isSuccess = true;
    }).
    addCase(getCurrentUser.rejected, (state) => {
      state.isLoading = false;
      state.isLoggedIn = false;
    });

    builder.
    addCase(changeCurrentPassword.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
    }).
    addCase(changeCurrentPassword.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
    }).
    addCase(changeCurrentPassword.rejected, (state) => {
      state.isLoading = false;
      state.isSuccess = false;
    });
    builder.
    addCase(resetPasswordWithToken.pending, (state) => {
      state.isLoading = true;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = "";
    }).
    addCase(resetPasswordWithToken.fulfilled, (state) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.errorMessage = "";
    }).
    addCase(resetPasswordWithToken.rejected, (state, action) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = true;
      state.errorMessage = action.payload || "Password reset failed";
    });

    builder.
    addCase(googleLogin.pending, (state) => {
      state.isLoading = true;
    }).
    addCase(googleLogin.fulfilled, (state) => {
      state.isLoading = false;
    }).
    addCase(googleLogin.rejected, (state) => {
      state.isLoading = false;
    });

    builder.
    addCase(login.pending, handlePending).
    addCase(login.fulfilled, handleFulfilled).
    addCase(login.rejected, handleRejected);

    builder.
    addCase(logout.pending, handlePending).
    addCase(logout.fulfilled, () => INITIAL_STATE).
    addCase(logout.rejected, (state, action) => {
      state.current = action.payload;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.isSuccess = true;
    });

    builder.
    addCase(updateProfile.pending, handlePending).
    addCase(updateProfile.fulfilled, handleFulfilled).
    addCase(updateProfile.rejected, handleRejected);
  }
});

export default authSlice.reducer;