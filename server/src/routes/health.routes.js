import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { healthCheck, getWaitingJobsCount } from "../queues/pdf.queue.js";
import mongoose from "mongoose";

const router = Router();


router.get("/redis", asyncHandler(async (req, res) => {
  const isHealthy = await healthCheck();

  if (isHealthy) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Redis connection is healthy",
      data: {
        redis: true,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  res.status(503).json({
    success: false,
    statusCode: 503,
    message: "Redis connection is not healthy",
    code: "REDIS_UNHEALTHY",
    errors: [],
    data: {
      redis: false,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}));

router.get("/mongodb", asyncHandler(async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1;

  if (mongoStatus) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "MongoDB connection is healthy",
      data: {
        mongodb: true,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  res.status(503).json({
    success: false,
    statusCode: 503,
    message: "MongoDB connection is not healthy",
    code: "MONGODB_UNHEALTHY",
    errors: [],
    data: {
      mongodb: false,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}));

router.get("/all", asyncHandler(async (req, res) => {
  const [redisHealthy, mongoHealthy, queueDepth] = await Promise.all([
    healthCheck(),
    Promise.resolve(mongoose.connection.readyState === 1),
    getWaitingJobsCount()
  ]);

  const allHealthy = redisHealthy && mongoHealthy;

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    statusCode: allHealthy ? 200 : 503,
    message: allHealthy ? "All systems are healthy" : "Some systems are unhealthy",
    code: allHealthy ? "ALL_SYSTEMS_HEALTHY" : "SYSTEMS_UNHEALTHY",
    errors: allHealthy ? [] : ["Some systems are not responding"],
    data: {
      environment: process.env.NODE_ENV || "development",
      systems: {
        server: true,
        redis: redisHealthy,
        mongodb: mongoHealthy,
        queueDepth
      },
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}));

router.get("/", asyncHandler(async (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    message: "Server is running correctly",
    data: {
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}));

export default router;