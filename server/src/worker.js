import 'dotenv/config';
import { initializePdfWorker } from './workers/pdf.worker.js';

async function start() {
  try {
    await initializePdfWorker();
  } catch (error) {
    process.exit(1);
  }
}

start();


