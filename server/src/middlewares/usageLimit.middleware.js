import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import requestIp from 'request-ip';
import { User } from '../models/user.model.js';

const PLAN_LIMITS = {
  FREE: { dailyOps: 100, maxSizeMB: 50 },
  PRO: { dailyOps: 500, maxSizeMB: 1024 },
  BUSINESS: { dailyOps: 1000, maxSizeMB: 2048 }
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
  const ip = requestIp.getClientIp(req);

  // Stateless: use claims from req.user if present, without DB lookup
  const claims = req.user || null;
  const limits = getLimitsFor(claims);

  const files = Object.values(req.files || {}).flat().concat(req.file ? [req.file] : []);
  const tooLarge = files.some((f) => (f.size || 0) / 1024 / 1024 > limits.maxSizeMB);
  if (tooLarge) {
    throw new ApiError(413, `File too large. Max size ${limits.maxSizeMB}MB on your plan`);
  }

  if (!claims) {
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

  // For logged-in user: rely on claims.plan only for limits; skip DB writes to stay stateless
  // Optional: implement Redis counters if persistence across instances is needed
  const key = `usage:${claims._id}:${new Date().toDateString()}`;
  if (!global.__userUsage) global.__userUsage = new Map();
  const record = global.__userUsage.get(key) || { lastResetAt: new Date(), dailyOperations: 0 };
  const fresh = resetIfNeeded(record);
  if (fresh.dailyOperations >= limits.dailyOps) {
    throw new ApiError(429, 'Daily plan limit reached. Upgrade plan to continue.');
  }
  fresh.dailyOperations += 1;
  global.__userUsage.set(key, fresh);
  next();
});