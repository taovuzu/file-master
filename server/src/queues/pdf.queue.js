import { Queue, QueueEvents } from 'bullmq';
import redis from '../db/redis.js';
import { ApiError } from '../utils/ApiError.js';

let pdfProcessingQueue, pdfQueueEvents;

async function healthCheck() {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
}

async function initializeQueue() {
  if (!pdfProcessingQueue) {
    pdfProcessingQueue = new Queue('pdf-processing-queue', {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 }
      }
    });
    pdfQueueEvents = new QueueEvents('pdf-processing-queue', {
      connection: redis
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
      const allowedKeys = [
        'outputFilePath', 'outputS3Key', 'message', 'operation',
        'originalFileName', 'completedAt', 'numberOfPages', 'filesCount',
        'error', 'failedAt', 'mergeImagesInOnePdf'
      ];
      for (const key of allowedKeys) {
        if (additionalData[key] !== undefined) essentialJobData[key] = additionalData[key];
      }
    }

    const sanitizedJobData = {};
    for (const [key, value] of Object.entries(essentialJobData)) {
      if (value !== undefined && value !== null) {
        sanitizedJobData[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
      }
    }

    await redis.hmset(`job:${jobId}`, sanitizedJobData);
    await redis.expire(`job:${jobId}`, 86400);
  } catch (error) {
    throw ApiError.internal(`Job status update failed: ${error.message}`);
  }
}

async function getJobStatus(jobId) {
  try {
    if (!(await healthCheck())) return null;
    const jobData = await redis.hgetall(`job:${jobId}`);
    return Object.keys(jobData).length > 0 ? jobData : null;
  } catch (error) {
    return null;
  }
}

async function deleteJobData(jobId) {
  try {
    if (!(await healthCheck())) throw ApiError.serviceUnavailable('Redis not healthy');
    await redis.del(`job:${jobId}`);
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
  pdfProcessingQueue, pdfQueueEvents, initializeQueue, updateJobStatus,
  getJobStatus, deleteJobData, healthCheck, getWaitingJobsCount, redis
};