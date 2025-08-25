// Select subscription plans
export const selectSubscriptionPlans = (state) => state.subscription.plans;

// Select current subscription
export const selectCurrentSubscription = (state) => state.subscription.currentSubscription;

// Select subscription loading state
export const selectSubscriptionLoading = (state) => state.subscription.isLoading;

// Select subscription success state
export const selectSubscriptionSuccess = (state) => state.subscription.isSuccess;

// Select subscription error
export const selectSubscriptionError = (state) => state.subscription.error;

// Select payment processing state
export const selectPaymentProcessing = (state) => state.subscription.paymentProcessing;

// Select subscription status
export const selectSubscriptionStatus = (state) => state.subscription.currentSubscription?.status;

// Select current plan
export const selectCurrentPlan = (state) => state.subscription.currentSubscription?.plan;

// Select subscription end date
export const selectSubscriptionEndDate = (state) => state.subscription.currentSubscription?.endDate;

// Select if user has active subscription
export const selectHasActiveSubscription = (state) => {
  const subscription = state.subscription.currentSubscription;
  return subscription && subscription.status === 'ACTIVE';
};

// Select if user is on free plan
export const selectIsFreePlan = (state) => {
  const subscription = state.subscription.currentSubscription;
  return !subscription || subscription.plan === 'FREE';
};

// Select if user is on pro plan
export const selectIsProPlan = (state) => {
  const subscription = state.subscription.currentSubscription;
  return subscription && subscription.plan === 'PRO' && subscription.status === 'ACTIVE';
};

// Select if user is on business plan
export const selectIsBusinessPlan = (state) => {
  const subscription = state.subscription.currentSubscription;
  return subscription && subscription.plan === 'BUSINESS' && subscription.status === 'ACTIVE';
};
