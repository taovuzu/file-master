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
    });
  } catch (error) {
    process.exit(1);
  }
}

async function shutdown(signal) {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    if (redisClient?.isOpen) {
      await redisClient.quit();
    }
  } catch (err) {
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
