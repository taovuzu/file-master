import Razorpay from "razorpay";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_DETAILS = {
  PRO: {
    name: "Pro Plan",
    amount: 999, // ₹999 = $12
    currency: "INR",
    interval: "month",
    features: {
      dailyOps: 500,
      maxSizeMB: 1024,
      priority: true,
      support: "email"
    }
  },
  BUSINESS: {
    name: "Business Plan",
    amount: 2999, // ₹2999 = $36
    currency: "INR",
    interval: "month",
    features: {
      dailyOps: 1000,
      maxSizeMB: 2048,
      priority: true,
      support: "priority",
      team: true
    }
  }
};

export const createSubscription = asyncHandler(async (req, res) => {
  const { planType } = req.body;
  const userId = req.user._id;

  if (!planType) {
    throw new ApiError(400, "Plan type is required");
  }

  if (!PLAN_DETAILS[planType]) {
    throw new ApiError(400, "Invalid plan type. Available plans: PRO, BUSINESS");
  }

  // Check if Razorpay is configured
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(500, "Payment gateway not configured");
  }

  // Check if plan IDs are configured
  const proPlanId = process.env.RAZORPAY_PRO_PLAN_ID;
  const businessPlanId = process.env.RAZORPAY_BUSINESS_PLAN_ID;
  
  if (!proPlanId || !businessPlanId) {
    throw new ApiError(500, "Subscription plans not configured. Please contact support.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if user already has an active subscription
  if (user.subscription && user.subscription.status === 'ACTIVE') {
    throw new ApiError(400, "User already has an active subscription");
  }

  const plan = PLAN_DETAILS[planType];
  
  try {
    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planType === 'PRO' ? proPlanId : businessPlanId,
      customer_notify: 1,
      total_count: 12, // 12 months
      notes: {
        user_id: userId.toString(),
        plan_type: planType
      }
    });

    // Update user subscription details
    user.subscription = {
      status: 'ACTIVE',
      plan: planType,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      razorpaySubscriptionId: subscription.id,
      razorpayCustomerId: subscription.customer_id,
      autoRenew: true
    };

    user.plan = planType;
    await user.save();

    return ApiResponse
      .success({
        subscriptionId: subscription.id,
        planType,
        amount: plan.amount,
        currency: plan.currency
      }, "Subscription created successfully", 201)
      .withRequest(req)
      .send(res);
  } catch (error) {
    console.error('Razorpay subscription creation error:', error);
    
    // Handle specific Razorpay errors
    if (error.error && error.error.description) {
      throw new ApiError(400, `Payment error: ${error.error.description}`);
    }
    
    throw new ApiError(500, "Failed to create subscription. Please try again.");
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

  const body = razorpay_subscription_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  // Find user by subscription ID
  const user = await User.findOne({
    "subscription.razorpaySubscriptionId": razorpay_subscription_id
  });

  if (!user) {
    throw new ApiError(404, "User not found for this subscription");
  }

  // Update subscription status
  user.subscription.status = 'ACTIVE';
  user.subscription.startDate = new Date();
  user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await user.save();

  return ApiResponse
    .success({}, "Payment verified successfully", 200)
    .withRequest(req)
    .send(res);
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.subscription.status !== 'ACTIVE') {
    throw new ApiError(400, "No active subscription to cancel");
  }

  try {
    // Cancel Razorpay subscription
    await razorpay.subscriptions.cancel(user.subscription.razorpaySubscriptionId);
    
    // Update user subscription
    user.subscription.status = 'CANCELLED';
    user.subscription.autoRenew = false;
    user.plan = 'FREE';
    await user.save();

    return ApiResponse
      .success({}, "Subscription cancelled successfully", 200)
      .withRequest(req)
      .send(res);
  } catch (error) {
    console.error('Razorpay subscription cancellation error:', error);
    throw new ApiError(500, "Failed to cancel subscription. Please try again.");
  }
});

export const getSubscriptionDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return ApiResponse
    .success({
      subscription: user.subscription,
      plan: user.plan,
      usage: user.usage
    }, "Subscription details fetched successfully", 200)
    .withRequest(req)
    .send(res);
});

export const getSubscriptionPlans = asyncHandler(async (req, res) => {
  return ApiResponse
    .success(PLAN_DETAILS, "Subscription plans fetched successfully", 200)
    .withRequest(req)
    .send(res);
});

export const webhookHandler = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  const { event, payload } = req.body;

  if (event === 'subscription.activated') {
    const subscriptionId = payload.subscription.id;
    const user = await User.findOne({
      "subscription.razorpaySubscriptionId": subscriptionId
    });

    if (user) {
      user.subscription.status = 'ACTIVE';
      user.subscription.startDate = new Date();
      user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
    }
  } else if (event === 'subscription.cancelled') {
    const subscriptionId = payload.subscription.id;
    const user = await User.findOne({
      "subscription.razorpaySubscriptionId": subscriptionId
    });

    if (user) {
      user.subscription.status = 'CANCELLED';
      user.plan = 'FREE';
      await user.save();
    }
  }

  res.status(200).json({ received: true });
});
