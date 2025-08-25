import { API_BASE_URL } from '@/config/serverApiConfig';
import errorHandler from '@/request/errorHandler';
import successHandler from '@/request/successHandler';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

const sendSubscriptionRequest = async (method, endpoint, data = {}, successOptions) => {
  try {
    const response = await axiosInstance({ 
      method, 
      url: endpoint, 
      data, 
      headers: { 'Content-Type': 'application/json' }, 
      withCredentials: true 
    });

    if (successOptions) {
      successHandler({ data: response.data, status: response.status }, successOptions);
    }
    return response.data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const getSubscriptionPlans = () =>
  sendSubscriptionRequest('get', 'subscriptions/plans');

export const createSubscription = ({ planType }) =>
  sendSubscriptionRequest('post', 'subscriptions/create', { planType });

export const verifyPayment = ({ razorpay_payment_id, razorpay_subscription_id, razorpay_signature }) =>
  sendSubscriptionRequest('post', 'subscriptions/verify', {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature
  });

export const cancelSubscription = () =>
  sendSubscriptionRequest('post', 'subscriptions/cancel');

export const getSubscriptionDetails = () =>
  sendSubscriptionRequest('get', 'subscriptions/details');

export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async (subscriptionData) => {
  try {
    const Razorpay = await loadRazorpayScript();
    
    // Get Razorpay key from environment variables
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKey) {
      throw new Error('Razorpay key not configured');
    }
    
    const options = {
      key: razorpayKey,
      subscription_id: subscriptionData.subscriptionId,
      name: 'FileMaster',
      description: `Subscribe to ${subscriptionData.planType} Plan`,
      currency: subscriptionData.currency,
      amount: subscriptionData.amount * 100, // Convert to paise
      prefill: {
        email: subscriptionData.email || '',
        contact: subscriptionData.phone || ''
      },
      theme: {
        color: '#3b82f6'
      }
    };

    return new Promise((resolve, reject) => {
      options.handler = function (response) {
        resolve(response);
      };
      
      options.modal = {
        ondismiss: function() {
          reject(new Error('Payment cancelled by user'));
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', (response) => {
        reject(new Error(response.error.description));
      });
    });
  } catch (error) {
    throw new Error('Failed to initialize Razorpay payment: ' + error.message);
  }
};
