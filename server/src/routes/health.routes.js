import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { healthCheck } from "../queues/pdf.queue.js";
import mongoose from "mongoose";
import cluster from "cluster";
import os from "os";
import { getClusterConfig } from "../config/cluster.config.js";

const router = Router();

router.get("/cluster", asyncHandler(async (req, res) => {
  const config = getClusterConfig();
  
  if (cluster.isPrimary) {
    // Master process
    const workers = Object.values(cluster.workers || {});
    const aliveWorkers = workers.filter(w => w && !w.isDead());
    const deadWorkers = workers.filter(w => w && w.isDead());
    
    const clusterInfo = {
      isMaster: true,
      pid: process.pid,
      workers: {
        total: workers.length,
        alive: aliveWorkers.length,
        dead: deadWorkers.length,
        details: aliveWorkers.map(w => ({
          id: w.id,
          pid: w.process.pid,
          state: w.state
        }))
      },
      system: {
        cpus: os.cpus().length,
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version
      },
      config: {
        enabled: config.enabled,
        numWorkers: config.numWorkers,
        restartDelay: config.restartDelay,
        maxRestarts: config.maxRestarts
      }
    };

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Cluster information retrieved successfully",
      data: clusterInfo,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  } else {
    // Worker process
    const workerInfo = {
      isMaster: false,
      workerId: cluster.worker.id,
      pid: process.pid,
      state: cluster.worker.state,
      system: {
        cpus: os.cpus().length,
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version
      }
    };

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Worker information retrieved successfully",
      data: workerInfo,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}));

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
  const redisHealthy = await healthCheck();
  const mongoHealthy = mongoose.connection.readyState === 1;

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
        mongodb: mongoHealthy
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