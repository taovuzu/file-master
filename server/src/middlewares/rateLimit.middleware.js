import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import redis from "../db/redis.js";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

export const globalSlowDown = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    prefix = "slowdown:",
    threshold = 100,
    calcDelayMs = (hitsOver) => hitsOver * 100
  } = options;

  return asyncHandler(async (req, res, next) => {
    try {
      const key = `${prefix}${req.clientIp || req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown"}`;

      const results = await redis.multi()
        .incr(key)
        .expire(key, Math.ceil(windowMs / 1000))
        .exec();

      const current = results?.[0]?.[1];

      if (current == null || Number.isNaN(Number(current))) {
        return next();
      }

      if (Number(current) <= threshold) {
        return next();
      }

      const delay = calcDelayMs(Number(current) - threshold);
      setTimeout(next, Math.max(0, delay));
    } catch (_) {
      return next();
    }
  });
};

export const sensitiveRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 20,
    prefix = "hardlimit:"
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: async (req, res) => {
      throw new ApiError(429, "Too many requests, please try again later.");
    },
    keyGenerator: (req) => req.clientIp || req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown",
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix
    })
  });
};

export const downloadRateLimiter = (options = {}) => {
  const {
    windowMs = 24 * 60 * 60 * 1000, // 24 hours
    max = 8, 
    prefix = "download:"
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: async (req, res) => {
      throw new ApiError(429, "Maximum download limit reached for this file. This file has been downloaded 8 times and is no longer available for download.");
    },
    keyGenerator: (req) => {
      const jobId = req.params?.jobId || 'unknown';
      return `${prefix}file:${jobId}`; // Only use jobId, no userId - global limit per file
    },
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix
    })
  });
};
