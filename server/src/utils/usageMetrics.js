import logger from './logger.js';
import { redisClient, healthCheck } from '../queues/pdf.queue.js';

class UsageMetrics {
  constructor() {
    this.metrics = {
      filesProcessed: 0,
      bytesUploaded: 0,
      bytesProcessed: 0,
      jobsCompleted: 0,
      jobsFailed: 0
    };
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await healthCheck();
      await this.loadMetricsFromRedis();
      this.startHourlyReporting();
      this.isInitialized = true;
      logger.info('Usage metrics initialized');
    } catch (error) {
      logger.error('Failed to initialize usage metrics', { error: error.message });
    }
  }

  async loadMetricsFromRedis() {
    try {
      this.metrics = await this.getCurrentMetrics(true);
    } catch (error) {
      logger.warn('Failed to load initial metrics from Redis, starting at 0.', { error: error.message });
    }
  }

  async incrementFilesProcessed(count = 1) {
    try {
      await redisClient.hIncrBy('usage_metrics', 'filesProcessed', count);
    } catch (error) {
      logger.error('Failed to increment filesProcessed', { error: error.message });
    }
  }

  async addBytesUploaded(bytes) {
    try {
      await redisClient.hIncrBy('usage_metrics', 'bytesUploaded', bytes);
    } catch (error) {
      logger.error('Failed to add bytesUploaded', { error: error.message });
    }
  }

  async addBytesProcessed(bytes) {
    try {
      await redisClient.hIncrBy('usage_metrics', 'bytesProcessed', bytes);
    } catch (error) {
      logger.error('Failed to add bytesProcessed', { error: error.message });
    }
  }

  async incrementJobsCompleted(count = 1) {
    try {
      await redisClient.hIncrBy('usage_metrics', 'jobsCompleted', count);
    } catch (error) {
      logger.error('Failed to increment jobsCompleted', { error: error.message });
    }
  }

  async incrementJobsFailed(count = 1) {
    try {
      await redisClient.hIncrBy('usage_metrics', 'jobsFailed', count);
    } catch (error) {
      logger.error('Failed to increment jobsFailed', { error: error.message });
    }
  }

  async logHourlyMetrics() {
    const processingKey = 'usage_metrics:processing';
    let metricsToLog = null;

    try {
      await redisClient.rename('usage_metrics', processingKey);
      metricsToLog = await redisClient.hGetAll(processingKey);
      await redisClient.del(processingKey);

    } catch (error) {
      if (error.message.includes("no such key")) {
        return;
      }
      logger.error('Failed to rotate hourly metrics', { error: error.message });
      return;
    }

    if (metricsToLog && Object.keys(metricsToLog).length > 0) {
      const parsedMetrics = {
        filesProcessed: parseInt(metricsToLog.filesProcessed) || 0,
        bytesUploaded: parseInt(metricsToLog.bytesUploaded) || 0,
        bytesProcessed: parseInt(metricsToLog.bytesProcessed) || 0,
        jobsCompleted: parseInt(metricsToLog.jobsCompleted) || 0,
        jobsFailed: parseInt(metricsToLog.jobsFailed) || 0,
        timestamp: new Date().toISOString()
      };

      logger.info('Hourly usage metrics', { metrics: parsedMetrics });

      this.metrics = {
        filesProcessed: 0,
        bytesUploaded: 0,
        bytesProcessed: 0,
        jobsCompleted: 0,
        jobsFailed: 0
      };
    }
  }

  startHourlyReporting() {
    setInterval(() => {
      this.logHourlyMetrics();
    }, 60 * 60 * 1000);
  }

  async getCurrentMetrics(suppressLogs = false) {
    try {
      const data = await redisClient.hGetAll('usage_metrics');

      const parsedMetrics = {
        filesProcessed: parseInt(data.filesProcessed) || 0,
        bytesUploaded: parseInt(data.bytesUploaded) || 0,
        bytesProcessed: parseInt(data.bytesProcessed) || 0,
        jobsCompleted: parseInt(data.jobsCompleted) || 0,
        jobsFailed: parseInt(data.jobsFailed) || 0
      };

      this.metrics = parsedMetrics;
      return { ...this.metrics };

    } catch (error) {
      if (!suppressLogs) {
        logger.error('Failed to get current metrics from Redis', { error: error.message });
      }
      return { ...this.metrics };
    }
  }
}

const usageMetrics = new UsageMetrics();

export default usageMetrics;