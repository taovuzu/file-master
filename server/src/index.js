import 'dotenv/config';
import connectDB from './db/index.db.js';
import { app } from './app.js';
import { initCleanup } from './utils/cleanup.js';
import { initializeQueue, redisClient, healthCheck } from './queues/pdf.queue.js';
import { initializePdfWorker } from './workers/pdf.worker.js';

let server;

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      try {
        if (redisClient?.isOpen) {
          await redisClient.quit();
          console.log('PDF processing Redis client closed');
        }
        if (typeof connectDB.disconnect === 'function') {
          await connectDB.disconnect();
          console.log('MongoDB connection closed');
        }
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });
  }
};

connectDB()
  .then(async () => {
    console.log('Database connected successfully');

    await initCleanup();
    await initializeQueue();
    await initializePdfWorker();
    healthCheck();

    const PORT = process.env.PORT || 8080;
    server = app.listen(PORT, () => {
      console.log(`App is listening at port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Could not connect to database: ${error.message}`);
    process.exit(1);
  });

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
