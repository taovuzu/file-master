export const selectAuthState = (state) => state.auth;

export const selectCurrentUser = (state) => state.auth.current;

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;

export const selectIsLoading = (state) => state.auth.isLoading;

export const selectIsSuccess = (state) => state.auth.isSuccess;

export const selectEmailRegistrationStep = (state) => state.auth.emailRegistrationStep;