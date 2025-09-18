import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { redisClient } from "../queues/pdf.queue.js";
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
      if (!redisClient.isOpen) {
        try { await redisClient.connect(); } catch (_) {}
      }

      const tx = redisClient.multi();
      tx.incr(key);
      tx.expire(key, Math.ceil(windowMs / 1000));
      const [hits] = await tx.exec();
      const current = Array.isArray(hits) ? Number(hits[1]) : Number(hits);

      if (Number.isNaN(current)) {
        return next();
      }

      if (current <= threshold) {
        return next();
      }

      const delay = calcDelayMs(current - threshold);
      setTimeout(next, Math.max(0, delay));
    } catch (_) {
      // Fail open on Redis issues
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
      sendCommand: async (...args) => {
        try {
          if (!redisClient.isOpen) {
            await redisClient.connect();
          }
        } catch (_) {}
        return redisClient.sendCommand(args);
      },
      prefix
    })
  });
};


