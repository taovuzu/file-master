import { createAsyncThunk } from '@reduxjs/toolkit';
import * as subscriptionService from '@/services/subscriptionService';

export const getSubscriptionPlans = createAsyncThunk(
  'subscription/getPlans',
  async (_, { rejectWithValue }) => {
    try {
      const data = await subscriptionService.getSubscriptionPlans();
      if (data.success) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Failed to fetch subscription plans');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch subscription plans');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/create',
  async ({ planType }, { rejectWithValue }) => {
    try {
      const data = await subscriptionService.createSubscription({ planType });
      if (data.success) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Failed to create subscription');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create subscription');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'subscription/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const data = await subscriptionService.verifyPayment(paymentData);
      if (data.success) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Payment verification failed');
    } catch (error) {
      return rejectWithValue(error.message || 'Payment verification failed');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancel',
  async (_, { rejectWithValue }) => {
    try {
      const data = await subscriptionService.cancelSubscription();
      if (data.success) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Failed to cancel subscription');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel subscription');
    }
  }
);

export const getSubscriptionDetails = createAsyncThunk(
  'subscription/getDetails',
  async (_, { rejectWithValue }) => {
    try {
      const data = await subscriptionService.getSubscriptionDetails();
      if (data.success) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Failed to fetch subscription details');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch subscription details');
    }
  }
);

export const processRazorpayPayment = createAsyncThunk(
  'subscription/processPayment',
  async ({ subscriptionData, userData }, { rejectWithValue }) => {
    try {
      const paymentResponse = await subscriptionService.initializeRazorpayPayment({
        ...subscriptionData,
        email: userData.email,
        phone: userData.profile?.phone || ''
      });
      
      if (paymentResponse.razorpay_payment_id) {
        const verificationData = await subscriptionService.verifyPayment({
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_subscription_id: subscriptionData.subscriptionId,
          razorpay_signature: paymentResponse.razorpay_signature
        });
        
        if (verificationData.success) {
          return verificationData.result;
        }
      }
      
      return rejectWithValue('Payment processing failed');
    } catch (error) {
      return rejectWithValue(error.message || 'Payment processing failed');
    }
  }
);
