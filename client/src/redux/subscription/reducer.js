import { createSlice } from '@reduxjs/toolkit';
import {
  getSubscriptionPlans,
  createSubscription,
  verifyPayment,
  cancelSubscription,
  getSubscriptionDetails,
  processRazorpayPayment
} from './actions';

const INITIAL_STATE = {
  plans: [],
  currentSubscription: null,
  isLoading: false,
  isSuccess: false,
  error: null,
  paymentProcessing: false
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: INITIAL_STATE,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    resetSubscriptionState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Get Subscription Plans
    builder
      .addCase(getSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubscriptionPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
        state.isSuccess = true;
      })
      .addCase(getSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isSuccess = false;
      });

    // Create Subscription
    builder
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isSuccess = false;
      });

    // Verify Payment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isSuccess = false;
      });

    // Cancel Subscription
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentSubscription = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isSuccess = false;
      });

    // Get Subscription Details
    builder
      .addCase(getSubscriptionDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubscriptionDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload;
        state.isSuccess = true;
      })
      .addCase(getSubscriptionDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isSuccess = false;
      });

    // Process Razorpay Payment
    builder
      .addCase(processRazorpayPayment.pending, (state) => {
        state.paymentProcessing = true;
        state.error = null;
      })
      .addCase(processRazorpayPayment.fulfilled, (state, action) => {
        state.paymentProcessing = false;
        state.isSuccess = true;
      })
      .addCase(processRazorpayPayment.rejected, (state, action) => {
        state.paymentProcessing = false;
        state.error = action.payload;
        state.isSuccess = false;
      });
  }
});

export const { clearSubscriptionError, resetSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
