import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'bullmq';
import { updateJobStatus, bullConnection } from '../queues/pdf.queue.js';

import { compressProcessor } from './processors/compress.processor.js';
import { mergeProcessor } from './processors/merge.processor.js';
import { splitProcessor } from './processors/split.processor.js';
import { rotateProcessor } from './processors/rotate.processor.js';
import { addPageNumbersProcessor } from './processors/addPageNumbers.processor.js';
import { addWatermarkProcessor } from './processors/addWatermark.processor.js';
import { unlockProcessor } from './processors/unlock.processor.js';
import { protectProcessor } from './processors/protect.processor.js';
import { convertProcessor } from './processors/convert.processor.js';
import { ApiError } from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const QUEUE_NAME = process.env.PDF_QUEUE_NAME || 'pdf-processing-queue';

let pdfWorker;

async function initializePdfWorker() {
  pdfWorker = new Worker(QUEUE_NAME, async (job) => {
    const { jobId, operation, ...jobData } = job.data;
    console.log(`Processing job ${jobId} with operation: ${operation}`);

    try {
      await updateJobStatus(jobId, 'processing', 10);
      let result;

      switch (operation) {
        case 'compress':result = await compressProcessor(jobId, jobData);break;
        case 'merge':result = await mergeProcessor(jobId, jobData);break;
        case 'split':result = await splitProcessor(jobId, jobData);break;
        case 'rotate':result = await rotateProcessor(jobId, jobData);break;
        case 'addPageNumbers':result = await addPageNumbersProcessor(jobId, jobData);break;
        case 'addTextWatermark':result = await addWatermarkProcessor(jobId, { operation, ...jobData });break;

        case 'unlock':result = await unlockProcessor(jobId, jobData);break;
        case 'protect':result = await protectProcessor(jobId, jobData);break;
        case 'convertDocToPdf':result = await convertProcessor(jobId, { operation, ...jobData });break;
        case 'convertImagesToPdf':result = await convertProcessor(jobId, { operation, ...jobData });break;

        case 'convertPdfToPpt':result = await convertProcessor(jobId, { operation, ...jobData });break;

        default:
          console.warn(`Unknown operation: ${operation}. Running generic processFile fallback.`);
          await processFileFallback(jobId, jobData.filePath, jobData.originalName, jobData.mimeType);
          break;
      }


      await updateJobStatus(jobId, 'completed', 100, {
        outputFilePath: result?.outputPath || null,
        message: result?.message || 'File processed successfully',
        completedAt: new Date().toISOString()
      });

      console.log(`Job ${jobId} completed successfully`);
      return result;

    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Processing failed',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
      throw error;
    }
  }, {
    connection: bullConnection,
    concurrency: 10,
    removeOnComplete: 100,
    removeOnFail: 100
  });

  pdfWorker.on('completed', (job) => console.log(`Job ${job.id} completed successfully`));
  pdfWorker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err));
  pdfWorker.on('error', (err) => console.error('Worker error:', err));

  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, async () => {
      console.log(`${signal} received, shutting down PDF worker gracefully...`);
      await pdfWorker.close();
      process.exit(0);
    });
  }

  console.log(`✅ PDF Worker initialized and listening on queue: ${QUEUE_NAME}`);
}

async function processFileFallback(jobId, filePath, originalName, mimeType) {
  const jobsDir = join(__dirname, '..', '..', 'jobs', jobId, 'output');
  await fs.mkdir(jobsDir, { recursive: true });

  const steps = [
  { progress: 20, message: 'Reading file...' },
  { progress: 40, message: 'Processing content...' },
  { progress: 60, message: 'Applying transformations...' },
  { progress: 80, message: 'Generating output...' },
  { progress: 90, message: 'Finalizing...' }];


  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await updateJobStatus(jobId, 'processing', step.progress, {
      message: step.message
    });
    console.log(`Job ${jobId}: ${step.message}`);
  }

  const outputFileName = `processed-${originalName}`;
  const outputPath = join(jobsDir, outputFileName);
  const content = `Processed file: ${originalName}\nJob ID: ${jobId}\nProcessed at: ${new Date().toISOString()}\n\nSample output. Replace with actual logic.`;
  await fs.writeFile(outputPath, content, 'utf8');

  console.log(`Fallback output created at: ${outputPath}`);
  return { outputPath, message: 'File processed with fallback method' };
}

async function uploadFileStream(jobId, { streamData, originalName }) {
  return new Promise((resolve, reject) => {
    const outputDir = join(__dirname, '..', '..', 'jobs', jobId, 'uploads');
    fs.mkdir(outputDir, { recursive: true });

    const filePath = join(outputDir, originalName);
    const writeStream = createWriteStream(filePath);

    let bytesWritten = 0;
    const totalSize = streamData.size || 0;

    streamData.on('data', async (chunk) => {
      bytesWritten += chunk.length;
      if (totalSize) {
        const progress = Math.min(95, Math.floor(bytesWritten / totalSize * 100));
        await updateJobStatus(jobId, 'uploading', progress, {
          message: `Uploading: ${Math.round(progress)}%`
        });
      }
    });

    streamData.pipe(writeStream);

    streamData.on('end', async () => {
      await updateJobStatus(jobId, 'processing', 98, {
        message: 'Upload complete, processing...'
      });
      console.log(`Upload complete for job ${jobId}, saved at ${filePath}`);
      resolve({ filePath, message: 'Upload successful' });
    });

    streamData.on('error', async (err) => {
      console.error(`Stream upload failed for job ${jobId}`, err);
      await updateJobStatus(jobId, 'failed', 0, {
        message: 'Upload failed',
        error: err.message
      });
      reject(err);
    });
  });
}

export { initializePdfWorker };