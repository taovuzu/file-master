import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { healthCheck } from "../queues/pdf.queue.js";
import mongoose from "mongoose";

const router = Router();

router.get("/redis", asyncHandler(async (req, res) => {
  const isHealthy = await healthCheck();

  if (isHealthy) {
    return res.status(200).json({
      status: "success",
      message: "Redis connection is healthy",
      timestamp: new Date().toISOString(),
    });
  }

  res.status(503).json({
    status: "error",
    message: "Redis connection is not healthy",
    timestamp: new Date().toISOString(),
  });
}));

router.get("/mongodb", asyncHandler(async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1; // 1 = connected

  if (mongoStatus) {
    return res.status(200).json({
      status: "success",
      message: "MongoDB connection is healthy",
      timestamp: new Date().toISOString(),
    });
  }

  res.status(503).json({
    status: "error",
    message: "MongoDB connection is not healthy",
    timestamp: new Date().toISOString(),
  });
}));

router.get("/all", asyncHandler(async (req, res) => {
  const redisHealthy = await healthCheck();
  const mongoHealthy = mongoose.connection.readyState === 1;

  const allHealthy = redisHealthy && mongoHealthy;

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "success" : "error",
    message: allHealthy ? "All systems are healthy" : "Some systems are unhealthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    systems: {
      server: true,
      redis: redisHealthy,
      mongodb: mongoHealthy,
    }
  });
}));


router.get("/", asyncHandler(async (req, res) => {
  res.json({
    status: "success",
    message: "Server is running correctly",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
}));

export default router;
