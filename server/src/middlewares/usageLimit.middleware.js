import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import requestIp from 'request-ip';
import { User } from '../models/user.model.js';

const PLAN_LIMITS = {
  FREE: { 
    dailyOps: 10, 
    maxSizeMB: 25,
    monthlyOps: 100,
    description: 'Free plan with basic limits'
  },
  PRO: { 
    dailyOps: 500, 
    maxSizeMB: 1024,
    monthlyOps: 5000,
    description: 'Pro plan with increased limits'
  },
  BUSINESS: { 
    dailyOps: 1000, 
    maxSizeMB: 2048,
    monthlyOps: 10000,
    description: 'Business plan with maximum limits'
  }
};

const getLimitsFor = (user) => {
  const plan = user?.plan || 'FREE';
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
};

const resetIfNeeded = (usage) => {
  const now = new Date();
  const last = usage?.lastResetAt ? new Date(usage.lastResetAt) : new Date(0);
  const crossedDay = now.toDateString() !== last.toDateString();
  const crossedMonth = now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
  
  if (crossedDay) {
    return { 
      ...usage,
      lastResetAt: now, 
      dailyOperations: 0 
    };
  }
  
  if (crossedMonth) {
    return { 
      ...usage,
      lastResetAt: now, 
      monthlyOperations: 0 
    };
  }
  
  return usage;
};

export const enforceUsageLimits = asyncHandler(async (req, res, next) => {
  const ip = requestIp.getClientIp(req);

  let user = req.user ? await User.findById(req.user._id) : null;
  const limits = getLimitsFor(user);

  const files = Object.values(req.files || {}).flat().concat(req.file ? [req.file] : []);
  const totalSizeMB = files.reduce((total, f) => total + ((f.size || 0) / 1024 / 1024), 0);
  
  if (totalSizeMB > limits.maxSizeMB) {
    throw new ApiError(413, `Total file size ${totalSizeMB.toFixed(2)}MB exceeds your plan limit of ${limits.maxSizeMB}MB. Upgrade to continue.`);
  }

  if (!user) {
    // Anonymous user limits
    if (!global.__anonUsage) global.__anonUsage = new Map();
    const record = global.__anonUsage.get(ip) || { 
      lastResetAt: new Date(), 
      dailyOperations: 0,
      monthlyOperations: 0 
    };
    
    const fresh = resetIfNeeded(record);
    if (fresh.dailyOperations >= limits.dailyOps) {
      throw new ApiError(429, `Daily free limit of ${limits.dailyOps} operations reached. Please login or upgrade your plan.`);
    }
    if (fresh.monthlyOperations >= limits.monthlyOps) {
      throw new ApiError(429, `Monthly free limit of ${limits.monthlyOps} operations reached. Please login or upgrade your plan.`);
    }
    
    fresh.dailyOperations += 1;
    fresh.monthlyOperations += 1;
    global.__anonUsage.set(ip, fresh);
    return next();
  }

  // Update user usage
  user.usage = resetIfNeeded(user.usage || { 
    lastResetAt: new Date(), 
    dailyOperations: 0,
    monthlyOperations: 0,
    totalOperations: 0,
    totalFilesProcessed: 0,
    totalDataProcessed: 0
  });

  if (user.usage.dailyOperations >= limits.dailyOps) {
    throw new ApiError(429, `Daily limit of ${limits.dailyOps} operations reached on your ${user.plan} plan. Upgrade to continue.`);
  }
  
  if (user.usage.monthlyOperations >= limits.monthlyOps) {
    throw new ApiError(429, `Monthly limit of ${limits.monthlyOps} operations reached on your ${user.plan} plan. Upgrade to continue.`);
  }

  // Increment usage counters
  user.usage.dailyOperations += 1;
  user.usage.monthlyOperations += 1;
  user.usage.totalOperations += 1;
  user.usage.totalFilesProcessed += files.length;
  user.usage.totalDataProcessed += totalSizeMB;
  
  await user.save();
  next();
});