import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from 'redis';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
  console.error('Redis Client Error:', err);
  isConnected = false;
});
redisClient.on('connect', () => {
  console.log('Redis Client Connected');
  isConnected = true;
});
redisClient.on('disconnect', () => {
  console.log('Redis Client Disconnected');
  isConnected = false;
});
redisClient.on('ready', () => {
  console.log('Redis Client Ready');
  isConnected = true;
});

async function connectRedis() {
  try {
    if (!isConnected || !redisClient.isOpen) {
      await redisClient.connect();
      isConnected = true;
      console.log('Redis client connected successfully');
    }
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
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
    console.error('Redis health check failed:', error);
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
        attempts: 1,
        backoff: { type: 'exponential', delay: 2000 }
      }
    });
    pdfQueueEvents = new QueueEvents('pdf-processing-queue', {
      connection: bullConnection
    });
    console.log('PDF processing queue + queue events initialized successfully');
  }
}

async function updateJobStatus(jobId, status, progress, additionalData = {}) {
  try {
    if (!(await healthCheck())) throw new Error('Redis not healthy');


    const essentialJobData = {
      status,
      progress: progress || 0,
      updatedAt: new Date().toISOString()
    };


    if (additionalData) {

      if (additionalData.outputFilePath) essentialJobData.outputFilePath = additionalData.outputFilePath;
      if (additionalData.message) essentialJobData.message = additionalData.message;
      if (additionalData.operation) essentialJobData.operation = additionalData.operation;
      if (additionalData.originalFileName) essentialJobData.originalFileName = additionalData.originalFileName;
      if (additionalData.completedAt) essentialJobData.completedAt = additionalData.completedAt;
      if (additionalData.numberOfPages) essentialJobData.numberOfPages = additionalData.numberOfPages;
      if (additionalData.filesCount) essentialJobData.filesCount = additionalData.filesCount;
      if (additionalData.error) essentialJobData.error = additionalData.error;
      if (additionalData.failedAt) essentialJobData.failedAt = additionalData.failedAt;
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
    console.error('Failed to update job status:', error);
    throw error;
  }
}

async function getJobStatus(jobId) {
  try {
    if (!(await healthCheck())) return null;

    const jobData = await redisClient.hGetAll(`job:${jobId}`);
    return Object.keys(jobData).length > 0 ? jobData : null;
  } catch (error) {
    console.error('Failed to get job status:', error);
    return null;
  }
}

async function deleteJobData(jobId) {
  try {
    if (!(await healthCheck())) throw new Error('Redis not healthy');
    await redisClient.del(`job:${jobId}`);
  } catch (error) {
    console.error('Failed to delete job data:', error);
  }
}

async function getWaitingJobsCount() {
  if (!pdfProcessingQueue) return 0;
  try {
    const waitingCount = await pdfProcessingQueue.getWaitingCount();
    const activeCount = await pdfProcessingQueue.getActiveCount();
    return (waitingCount || 0) + (activeCount || 0);
  } catch (err) {
    console.error('[pdf.queue] Failed to get waiting+active jobs count:', err);
    return 0;
  }
}

export {
  pdfProcessingQueue, pdfQueueEvents, initializeQueue, updateJobStatus, getJobStatus, deleteJobData, healthCheck, getWaitingJobsCount, redisClient, bullConnection };