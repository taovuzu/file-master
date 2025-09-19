import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import requestIp from 'request-ip';
import { User } from '../models/user.model.js';
import { redisClient, healthCheck } from '../queues/pdf.queue.js';

const PLAN_LIMITS = {
  FREE: { dailyOps: 10000, maxSizeMB: 50 }, // as i am developing application therefore such huge limit 
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

  const claims = req.user || null;
  const limits = getLimitsFor(claims);

  const files = Object.values(req.files || {}).flat().concat(req.file ? [req.file] : []);
  const tooLarge = files.some((f) => (f.size || 0) / 1024 / 1024 > limits.maxSizeMB);
  if (tooLarge) {
    throw new ApiError(413, `File too large. Max size ${limits.maxSizeMB}MB on your plan`);
  }

  if (!claims) {
    await healthCheck();
    const key = `anon:usage:${ip}:${new Date().toDateString()}`;
    
    const tx = redisClient.multi();
    tx.hGetAll(key);
    tx.hSet(key, { lastResetAt: new Date().toISOString(), dailyOperations: 0 });
    tx.expire(key, 86400); // 24 hours
    const [existing, _] = await tx.exec();
    
    const record = existing && Object.keys(existing).length > 0 ? existing : { lastResetAt: new Date().toISOString(), dailyOperations: 0 };
    const fresh = resetIfNeeded(record);
    
    if (fresh.dailyOperations >= limits.dailyOps) {
      throw new ApiError(429, 'Daily free limit reached. Visit /pricing to upgrade.');
    }
    
    fresh.dailyOperations += 1;
    await redisClient.hSet(key, fresh);
    return next();
  }

  await healthCheck();
  const key = `user:usage:${claims._id}:${new Date().toDateString()}`;
  
  const tx = redisClient.multi();
  tx.hGetAll(key);
  tx.hSet(key, { lastResetAt: new Date().toISOString(), dailyOperations: 0 });
  tx.expire(key, 86400); // 24 hours
  const [existing, _] = await tx.exec();
  
  const record = existing && Object.keys(existing).length > 0 ? existing : { lastResetAt: new Date().toISOString(), dailyOperations: 0 };
  const fresh = resetIfNeeded(record);
  
  if (fresh.dailyOperations >= limits.dailyOps) {
    throw new ApiError(429, 'Daily plan limit reached. Upgrade plan to continue.');
  }
  
  fresh.dailyOperations += 1;
  await redisClient.hSet(key, fresh);
  next();
});