import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from 'redis';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ApiError } from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(import.meta.url);

const bullConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  connectTimeout: 20000,
  retryStrategy: (times) => Math.min(times * 500, 5000)
});

const redisClient = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

let isConnected = false;

redisClient.on('error', (err) => {
  isConnected = false;
});
redisClient.on('connect', () => {
  isConnected = true;
});
redisClient.on('disconnect', () => {
  isConnected = false;
});
redisClient.on('ready', () => {
  isConnected = true;
});

async function connectRedis() {
  try {
    if (!isConnected || !redisClient.isOpen) {
      await redisClient.connect();
      isConnected = true;
    }
  } catch (error) {
    throw ApiError.internal(`Job status update failed: ${error.message}`);
  }
}

async function healthCheck() {
  try {
    if (!isConnected || !redisClient.isOpen) {
      await connectRedis();
    }
    await redisClient.ping();
    return true;
  } catch (error) {
    isConnected = false;
    return false;
  }
}

let pdfProcessingQueue, pdfQueueEvents;

async function initializeQueue() {
  await connectRedis();
  if (!pdfProcessingQueue) {
    pdfProcessingQueue = new Queue('pdf-processing-queue', {
      connection: bullConnection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 }
      }
    });
    pdfQueueEvents = new QueueEvents('pdf-processing-queue', {
      connection: bullConnection
    });
  }
}

async function updateJobStatus(jobId, status, progress, additionalData = {}) {
  try {
    if (!(await healthCheck())) throw ApiError.serviceUnavailable('Redis not healthy');


    const essentialJobData = {
      status,
      progress: progress || 0,
      updatedAt: new Date().toISOString()
    };


    if (additionalData) {

      if (additionalData.outputFilePath) essentialJobData.outputFilePath = additionalData.outputFilePath;
      if (additionalData.outputS3Key) essentialJobData.outputS3Key = additionalData.outputS3Key;
      if (additionalData.message) essentialJobData.message = additionalData.message;
      if (additionalData.operation) essentialJobData.operation = additionalData.operation;
      if (additionalData.originalFileName) essentialJobData.originalFileName = additionalData.originalFileName;
      if (additionalData.completedAt) essentialJobData.completedAt = additionalData.completedAt;
      if (additionalData.numberOfPages) essentialJobData.numberOfPages = additionalData.numberOfPages;
      if (additionalData.filesCount) essentialJobData.filesCount = additionalData.filesCount;
      if (additionalData.error) essentialJobData.error = additionalData.error;
      if (additionalData.failedAt) essentialJobData.failedAt = additionalData.failedAt;
      if (additionalData.mergeImagesInOnePdf !== undefined) essentialJobData.mergeImagesInOnePdf = additionalData.mergeImagesInOnePdf;
    }



    const sanitizedJobData = {};
    Object.entries(essentialJobData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        sanitizedJobData[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
      }
    });

    await redisClient.hSet(`job:${jobId}`, sanitizedJobData);
    await redisClient.expire(`job:${jobId}`, 86400);
  } catch (error) {
    throw ApiError.internal(`Job status update failed: ${error.message}`);
  }
}

async function getJobStatus(jobId) {
  try {
    if (!(await healthCheck())) return null;

    const jobData = await redisClient.hGetAll(`job:${jobId}`);
    return Object.keys(jobData).length > 0 ? jobData : null;
  } catch (error) {
    return null;
  }
}

async function deleteJobData(jobId) {
  try {
    if (!(await healthCheck())) throw ApiError.serviceUnavailable('Redis not healthy');
    await redisClient.del(`job:${jobId}`);
  } catch (error) {
  }
}

async function getWaitingJobsCount() {
  if (!pdfProcessingQueue) return 0;
  try {
    const waitingCount = await pdfProcessingQueue.getWaitingCount();
    const activeCount = await pdfProcessingQueue.getActiveCount();
    return (waitingCount || 0) + (activeCount || 0);
  } catch (err) {
    return 0;
  }
}

export {
  pdfProcessingQueue, pdfQueueEvents, initializeQueue, updateJobStatus, getJobStatus, deleteJobData, healthCheck, getWaitingJobsCount, redisClient, bullConnection };