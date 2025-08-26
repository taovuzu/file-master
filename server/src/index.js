import 'dotenv/config';
import cluster from 'cluster';
import ClusterManager from './cluster.js';
import { getClusterConfig } from './config/cluster.config.js';
import connectDB from './db/index.db.js';
import { app } from './app.js';
import { initCleanup } from './utils/cleanup.js';
import { initializeQueue, redisClient, healthCheck } from './queues/pdf.queue.js';
import { initializePdfWorker } from './workers/pdf.worker.js';

const config = getClusterConfig();

const clusterManager = new ClusterManager({
  numWorkers: config.numWorkers,
  restartDelay: config.restartDelay,
  maxRestarts: config.maxRestarts
});

if (config.enabled) {
  clusterManager.start();
} else {
  console.log('🚫 Cluster mode disabled, running in single process mode');
}

if (!cluster.isPrimary || !config.enabled) {
  let server;

  const shutdown = async (signal) => {
    const processType = cluster.isPrimary ? 'Main' : 'Worker';
    console.log(`${processType} ${process.pid}: ${signal} received, shutting down gracefully...`);
    if (server) {
      server.close(async () => {
        console.log(`${processType} ${process.pid}: HTTP server closed`);
        try {
          if (redisClient?.isOpen) {
            await redisClient.quit();
            console.log(`${processType} ${process.pid}: PDF processing Redis client closed`);
          }
          if (typeof connectDB.disconnect === 'function') {
            await connectDB.disconnect();
            console.log(`${processType} ${process.pid}: MongoDB connection closed`);
          }
          process.exit(0);
        } catch (error) {
          console.error(`${processType} ${process.pid}: Error during shutdown:`, error);
          process.exit(1);
        }
      });
    }
  };

  if (!cluster.isPrimary) {
    process.on('message', (msg) => {
      if (msg === 'shutdown') {
        shutdown('SHUTDOWN_SIGNAL');
      }
    });
  }

  connectDB().
  then(async () => {
    const processType = cluster.isPrimary ? 'Main' : 'Worker';
    console.log(`${processType} ${process.pid}: Database connected successfully`);

    await initCleanup();
    await initializeQueue();
    await initializePdfWorker();
    healthCheck();

    const PORT = process.env.PORT || 8080;
    server = app.listen(PORT, () => {
      console.log(`${processType} ${process.pid}: App is listening at port ${PORT}`);
    });
  }).
  catch((error) => {
    const processType = cluster.isPrimary ? 'Main' : 'Worker';
    console.error(`${processType} ${process.pid}: Could not connect to database: ${error.message}`);
    process.exit(1);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}