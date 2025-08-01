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
import { mapJobStatusToUserFriendly, getProgressForStatus } from '../utils/jobStatusMapper.js';
import logger from '../utils/logger.js';
import usageMetrics from '../utils/usageMetrics.js';
import { ApiError } from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const QUEUE_NAME = process.env.PDF_QUEUE_NAME || 'pdf-processing-queue';

let pdfWorker;

async function initializePdfWorker() {
  pdfWorker = new Worker(QUEUE_NAME, async (job) => {
    const { jobId, operation, ...jobData } = job.data;
    logger.info('Job processing started', { jobId, operation });

    try {
      await updateJobStatus(jobId, 'processing', 10, {
        message: mapJobStatusToUserFriendly('processing')
      });
      let result;

      switch (operation) {
        case 'compress': result = await compressProcessor(jobId, jobData); break;
        case 'merge': result = await mergeProcessor(jobId, jobData); break;
        case 'split': result = await splitProcessor(jobId, jobData); break;
        case 'rotate': result = await rotateProcessor(jobId, jobData); break;
        case 'addPageNumbers': result = await addPageNumbersProcessor(jobId, jobData); break;
        case 'addTextWatermark': result = await addWatermarkProcessor(jobId, { operation, ...jobData }); break;

        case 'unlock': result = await unlockProcessor(jobId, jobData); break;
        case 'protect': result = await protectProcessor(jobId, jobData); break;
        case 'convertDocToPdf': result = await convertProcessor(jobId, { operation, ...jobData }); break;
        case 'convertImagesToPdf': result = await convertProcessor(jobId, { operation, ...jobData }); break;

        case 'convertPdfToPpt': result = await convertProcessor(jobId, { operation, ...jobData }); break;

        default:
          await processFileFallback(jobId, jobData.filePath, jobData.originalName, jobData.mimeType);
          break;
      }


      await updateJobStatus(jobId, 'completed', 100, {
        outputFilePath: result?.outputPath || null,
        message: mapJobStatusToUserFriendly('completed'),
        completedAt: new Date().toISOString()
      });

      await usageMetrics.incrementJobsCompleted();
      if (result?.fileSize) {
        await usageMetrics.addBytesProcessed(result.fileSize);
      }

      logger.info('Job completed successfully', { jobId, operation });
      return result;

    } catch (error) {
      logger.error('Job processing failed', {
        jobId,
        operation,
        error: error.message,
        stack: error.stack
      });

      await updateJobStatus(jobId, 'failed', 0, {
        message: mapJobStatusToUserFriendly('failed'),
        error: error.stack,
        failedAt: new Date().toISOString()
      });

      await usageMetrics.incrementJobsFailed();
      throw ApiError.internal(`PDF worker processing failed: ${error.message}`);
    }
  }, {
    connection: bullConnection,
    concurrency: 10,
    removeOnComplete: 100,
    removeOnFail: 100
  });

  pdfWorker.on('completed', (job) => {
    logger.info('Worker job completed', { jobId: job.id });
  });

  pdfWorker.on('failed', (job, err) => {
    logger.error('Worker job failed', {
      jobId: job.id,
      error: err.message,
      stack: err.stack
    });
  });

  pdfWorker.on('error', (err) => {
    logger.error('Worker error occurred', {
      error: err.message,
      stack: err.stack
    });
  });

  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, async () => {
      logger.info('Worker shutdown signal received', { signal });
      await pdfWorker.close();
      process.exit(0);
    });
  }

  logger.info('PDF Worker initialized successfully', { queueName: QUEUE_NAME });
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
  }

  const outputFileName = `processed-${originalName}`;
  const outputPath = join(jobsDir, outputFileName);
  const content = `Processed file: ${originalName}\nJob ID: ${jobId}\nProcessed at: ${new Date().toISOString()}\n\nSample output. Replace with actual logic.`;
  await fs.writeFile(outputPath, content, 'utf8');
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
      resolve({ filePath, message: 'Upload successful' });
    });

    streamData.on('error', async (err) => {
      await updateJobStatus(jobId, 'failed', 0, {
        message: 'Upload failed',
        error: err.message
      });
      reject(err);
    });
  });
}

export { initializePdfWorker };