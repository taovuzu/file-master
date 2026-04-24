import { Worker } from 'bullmq';
import redis from '../db/redis.js';
import { updateJobStatus } from '../queues/pdf.queue.js';

import { compressProcessor } from './processors/compress.processor.js';
import { mergeProcessor } from './processors/merge.processor.js';
import { splitProcessor } from './processors/split.processor.js';
import { rotateProcessor } from './processors/rotate.processor.js';
import { addPageNumbersProcessor } from './processors/addPageNumbers.processor.js';
import { addWatermarkProcessor } from './processors/addWatermark.processor.js';
import { unlockProcessor } from './processors/unlock.processor.js';
import { protectProcessor } from './processors/protect.processor.js';
import { convertProcessor } from './processors/convert.processor.js';
import { mapJobStatusToUserFriendly } from '../utils/jobStatusMapper.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

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
          throw ApiError.badRequest(`Unknown operation: ${operation}`);
      }

      await updateJobStatus(jobId, 'completed', 100, {
        outputFilePath: result?.outputPath || null,
        message: mapJobStatusToUserFriendly('completed'),
        completedAt: new Date().toISOString()
      });

      logger.info('Job completed successfully', { jobId, operation });
      return result;

    } catch (error) {
      logger.error('Job processing failed', {
        jobId, operation, error: error.message, stack: error.stack
      });

      await updateJobStatus(jobId, 'failed', 0, {
        message: mapJobStatusToUserFriendly('failed'),
        error: error.stack,
        failedAt: new Date().toISOString()
      });

      throw ApiError.internal(`PDF worker processing failed: ${error.message}`);
    }
  }, {
    connection: redis,
    concurrency: 10,
    removeOnComplete: 100,
    removeOnFail: 100
  });

  pdfWorker.on('completed', (job) => {
    logger.info('Worker job completed', { jobId: job.id });
  });

  pdfWorker.on('failed', (job, err) => {
    logger.error('Worker job failed', { jobId: job.id, error: err.message, stack: err.stack });
  });

  pdfWorker.on('error', (err) => {
    logger.error('Worker error occurred', { error: err.message, stack: err.stack });
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

export { initializePdfWorker };