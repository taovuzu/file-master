import IORedis from 'ioredis';
import logger from '../utils/logger.js';

const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  connectTimeout: 20000,
  retryStrategy: (times) => Math.min(times * 500, 5000),
  lazyConnect: false,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

export default redis;
