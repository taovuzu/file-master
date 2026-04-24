import { v4 as uuidv4 } from 'uuid';
import { pdfProcessingQueue, updateJobStatus, healthCheck } from '../queues/pdf.queue.js';
import { ApiError } from './ApiError.js';
import { ApiResponse } from './ApiResponse.js';

async function ensureRedisHealthy(maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (await healthCheck()) return;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  throw ApiError.serviceUnavailable('Unable to establish Redis connection');
}

async function enqueueJob({
  queueName,
  operation,
  jobData,
  statusMeta = {},
  responseMeta = {},
  successMessage,
  queueOptions,
  req,
  res
}) {
  const jobId = uuidv4();

  try {
    await ensureRedisHealthy();

    await updateJobStatus(jobId, 'queued', 0, {
      createdAt: new Date().toISOString(),
      operation,
      ...statusMeta
    });

    await pdfProcessingQueue.add(queueName, {
      jobId,
      operation,
      ...jobData
    }, queueOptions);

  } catch (error) {
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || `Failed to queue ${operation} job`,
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (_) {}

    throw ApiError.internal(`${operation} operation failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: 'Your job has been queued. Use the job ID to track progress.',
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation,
      ...responseMeta
    }, successMessage, 200)
    .withRequest(req)
    .send(res);
}

export { enqueueJob, ensureRedisHealthy };
