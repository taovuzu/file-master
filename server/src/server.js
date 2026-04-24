import 'dotenv/config';
import connectDB from './db/index.db.js';
import { app } from './app.js';
import { initCleanup } from './utils/cleanup.js';
import { initializeQueue, healthCheck } from './queues/pdf.queue.js';
import redis from './db/redis.js';
import logger from './utils/logger.js';

let server;

async function start() {
  try {
    logger.info('Starting server initialization');
    await connectDB();
    logger.info('Database connected successfully');
    await initCleanup();
    logger.info('Cleanup service initialized');
    await initializeQueue();
    logger.info('Queue system initialized');
    await healthCheck();
    logger.info('Health check passed');

    const PORT = process.env.PORT || 8080;
    server = app.listen(PORT, () => {
      logger.info(`Server started successfully on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      logger.info('HTTP server closed');
    }
    if (redis.status === 'ready' || redis.status === 'connect') {
      await redis.quit();
      logger.info('Redis connection closed');
    }
    logger.info('Server shutdown completed');
  } catch (err) {
    logger.error('Error during shutdown', {
      error: err.message,
      stack: err.stack
    });
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
