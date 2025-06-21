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
      const data = await redisClient.hGetAll('usage_metrics');
      if (data && Object.keys(data).length > 0) {
        this.metrics.filesProcessed = parseInt(data.filesProcessed) || 0;
        this.metrics.bytesUploaded = parseInt(data.bytesUploaded) || 0;
        this.metrics.bytesProcessed = parseInt(data.bytesProcessed) || 0;
        this.metrics.jobsCompleted = parseInt(data.jobsCompleted) || 0;
        this.metrics.jobsFailed = parseInt(data.jobsFailed) || 0;
      }
    } catch (error) {
      logger.error('Failed to load metrics from Redis', { error: error.message });
    }
  }

  async saveMetricsToRedis() {
    try {
      await redisClient.hSet('usage_metrics', this.metrics);
    } catch (error) {
      logger.error('Failed to save metrics to Redis', { error: error.message });
    }
  }

  async incrementFilesProcessed(count = 1) {
    this.metrics.filesProcessed += count;
    await this.saveMetricsToRedis();
  }

  async addBytesUploaded(bytes) {
    this.metrics.bytesUploaded += bytes;
    await this.saveMetricsToRedis();
  }

  async addBytesProcessed(bytes) {
    this.metrics.bytesProcessed += bytes;
    await this.saveMetricsToRedis();
  }

  async incrementJobsCompleted(count = 1) {
    this.metrics.jobsCompleted += count;
    await this.saveMetricsToRedis();
  }

  async incrementJobsFailed(count = 1) {
    this.metrics.jobsFailed += count;
    await this.saveMetricsToRedis();
  }

  async logHourlyMetrics() {
    try {
      logger.info('Hourly usage metrics', { 
        metrics: {
          filesProcessed: this.metrics.filesProcessed,
          bytesUploaded: this.metrics.bytesUploaded,
          bytesProcessed: this.metrics.bytesProcessed,
          jobsCompleted: this.metrics.jobsCompleted,
          jobsFailed: this.metrics.jobsFailed,
          timestamp: new Date().toISOString()
        }
      });

      this.resetMetrics();
    } catch (error) {
      logger.error('Failed to log hourly metrics', { error: error.message });
    }
  }

  resetMetrics() {
    this.metrics = {
      filesProcessed: 0,
      bytesUploaded: 0,
      bytesProcessed: 0,
      jobsCompleted: 0,
      jobsFailed: 0
    };
    this.saveMetricsToRedis();
  }

  startHourlyReporting() {
    setInterval(() => {
      this.logHourlyMetrics();
    }, 60 * 60 * 1000);
  }

  getCurrentMetrics() {
    return { ...this.metrics };
  }
}

const usageMetrics = new UsageMetrics();

export default usageMetrics;
