import 'dotenv/config';
import connectDB from './db/index.db.js';
import { app } from './app.js';
import { initCleanup } from './utils/cleanup.js';
import { initializeQueue, redisClient, healthCheck } from './queues/pdf.queue.js';

let server;

async function start() {
  try {
    await connectDB();
    await initCleanup();
    await initializeQueue();
    await healthCheck();

    const PORT = process.env.PORT || 8080;
    server = app.listen(PORT, () => {
      console.log(`API listening on port ${PORT} (pid ${process.pid})`);
    });
  } catch (error) {
    console.error(`Failed to start API server (pid ${process.pid}):`, error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down API (pid ${process.pid})...`);

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log(`HTTP server closed`);
    }

    if (redisClient?.isOpen) {
      await redisClient.quit();
      console.log(`Redis client closed`);
    }
  } catch (err) {
    console.error(`Error during shutdown:`, err);
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();


