import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import requestIp from 'request-ip';
import { User } from '../models/user.model.js';

const PLAN_LIMITS = {
  FREE: { dailyOps: 10, maxSizeMB: 25 },
  PRO: { dailyOps: 200, maxSizeMB: 200 },
  BUSINESS: { dailyOps: 1000, maxSizeMB: 500 },
};

const getLimitsFor = (user) => {
  const plan = user?.plan || 'FREE';
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
};

const resetIfNeeded = (usage) => {
  const now = new Date();
  const last = usage?.lastResetAt ? new Date(usage.lastResetAt) : new Date(0);
  const crossedDay = now.toDateString() !== last.toDateString();
  if (crossedDay) {
    return { lastResetAt: now, dailyOperations: 0 };
  }
  return usage;
};

export const enforceUsageLimits = asyncHandler(async (req, res, next) => {
  // Identify user or anonymous by IP
  const ip = requestIp.getClientIp(req);

  let user = req.user ? await User.findById(req.user._id) : null;
  const limits = getLimitsFor(user);

  // Check file size against plan limits
  const files = Object.values(req.files || {}).flat().concat(req.file ? [req.file] : []);
  const tooLarge = files.some((f) => (f.size || 0) / 1024 / 1024 > limits.maxSizeMB);
  if (tooLarge) {
    throw new ApiError(413, `File too large. Max size ${limits.maxSizeMB}MB on your plan`);
  }

  // Anonymous usage tracked by memory map keyed by IP
  if (!user) {
    if (!global.__anonUsage) global.__anonUsage = new Map();
    const record = global.__anonUsage.get(ip) || { lastResetAt: new Date(), dailyOperations: 0 };
    const fresh = resetIfNeeded(record);
    if (fresh.dailyOperations >= limits.dailyOps) {
      throw new ApiError(429, 'Daily free limit reached. Visit /pricing to upgrade.');
    }
    fresh.dailyOperations += 1;
    global.__anonUsage.set(ip, fresh);
    return next();
  }

  // Logged-in user: persist usage counters
  user.usage = resetIfNeeded(user.usage || { lastResetAt: new Date(), dailyOperations: 0 });
  if (user.usage.dailyOperations >= limits.dailyOps) {
    throw new ApiError(429, 'Daily plan limit reached. Upgrade plan to continue.');
  }
  user.usage.dailyOperations += 1;
  await user.save();
  next();
});


