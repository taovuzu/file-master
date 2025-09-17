import 'dotenv/config';
import { initializePdfWorker } from './workers/pdf.worker.js';

async function start() {
  try {
    await initializePdfWorker();
  } catch (error) {
    console.error(`Worker ${process.pid}: Failed to start worker:`, error);
    process.exit(1);
  }
}

start();


