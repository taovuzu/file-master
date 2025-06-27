import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import requestIp from 'request-ip';
import { redisClient, healthCheck } from '../queues/pdf.queue.js';

const PLAN_LIMITS = {
  FREE: { dailyOps: 30, maxSizeMB: 50 },
  PRO: { dailyOps: 500, maxSizeMB: 400 },
  BUSINESS: { dailyOps: 1000, maxSizeMB: 800 }
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
    return { lastResetAt: now.toISOString(), dailyOperations: 0 };
  }
  return usage;
};

export const enforceUsageLimits = asyncHandler(async (req, res, next) => {
  const ip = requestIp.getClientIp(req);
  const claims = req.user || null;
  const limits = getLimitsFor(claims);

  const files = Object.values(req.files || {}).flat().concat(req.file ? [req.file] : []);
  if (files.length > 0) {
    const tooLarge = files.some((f) => (f.size || 0) / 1024 / 1024 > limits.maxSizeMB);
    if (tooLarge) {
      throw new ApiError(413, `File too large. Max size ${limits.maxSizeMB}MB on your plan`);
    }
  }

  await healthCheck();

  const key = claims
    ? `user:usage:${claims._id}:${new Date().toDateString()}`
    : `anon:usage:${ip}:${new Date().toDateString()}`;

  const MAX_RETRIES = 5;
  for (let i = 0; i < MAX_RETRIES; i++) {
    await redisClient.watch(key);

    const existing = await redisClient.hGetAll(key);
    const record = existing && Object.keys(existing).length > 0 ? existing : { lastResetAt: new Date(0).toISOString(), dailyOperations: '0' };
    const fresh = resetIfNeeded(record);
    
    const currentOperations = parseInt(fresh.dailyOperations, 10) || 0;
    
    if (currentOperations >= limits.dailyOps) {
      await redisClient.unwatch();
      const errorMessage = claims
        ? 'Daily plan limit reached. Upgrade plan to continue.'
        : 'Daily free limit reached. Visit /pricing to upgrade.';
      throw new ApiError(429, errorMessage);
    }
    
    const newOperations = currentOperations + 1;

    const multi = redisClient.multi()
      .hSet(key, { ...fresh, dailyOperations: newOperations.toString() })
      .expire(key, 86400);

    const result = await multi.exec();

    if (result !== null) {
      return next();
    }
  }

  throw new ApiError(500, 'Could not update usage data. Please try again.');
});