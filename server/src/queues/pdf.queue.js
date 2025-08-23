import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from 'redis';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bullConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  connectTimeout: 20000,
  retryStrategy: (times) => Math.min(times * 500, 5000),
});

const redisClient = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
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

let pdfProcessingQueue;

async function initializeQueue() {
  await connectRedis();
  if (!pdfProcessingQueue) {
    pdfProcessingQueue = new Queue('pdf-processing-queue', {
      connection: bullConnection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
      },
    });
    console.log('PDF processing queue initialized successfully');
  }
}

const JOB_KEY_PREFIX = 'pdf-job';

async function updateJobStatus(jobId, status, progress) {
  try {
    if (!(await healthCheck())) throw new Error('Redis not healthy');

    const jobData = {
      status,
      progress,
      updatedAt: new Date().toISOString(),
    };

    await redisClient.set(`${JOB_KEY_PREFIX}:${jobId}`, JSON.stringify(jobData), { EX: 600 });
  } catch (error) {
    console.error('Failed to update job status:', error);
    throw error;
  }
}

async function getJobStatus(jobId) {
  try {
    if (!(await healthCheck())) return null;

    const jobData = await redisClient.get(`${JOB_KEY_PREFIX}:${jobId}`);
    return jobData ? JSON.parse(jobData) : null;
  } catch (error) {
    console.error('Failed to get job status:', error);
    return null;
  }
}

async function deleteJobData(jobId) {
  try {
    if (!(await healthCheck())) throw new Error('Redis not healthy');
    await redisClient.del(`${JOB_KEY_PREFIX}:${jobId}`);
  } catch (error) {
    console.error('Failed to delete job data:', error);
    throw error;
  }
}

export {
  pdfProcessingQueue,
  initializeQueue,
  updateJobStatus,
  getJobStatus,
  deleteJobData,
  healthCheck,
  redisClient,
  bullConnection,
};
