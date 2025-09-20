import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";
import { s3Bucket } from "../utils/s3.js";

const mergePdfFiles = asyncHandler(async (req, res) => {
  const { s3Keys, originalFileNames } = req.body || {};
  if (!s3Keys || !Array.isArray(s3Keys) || s3Keys.length === 0) {
    throw ApiError.badRequest("Missing s3Keys. Upload the files to S3 first.");
  }

  const jobId = uuidv4();
  const outputName = `${uuidv4()}___file_master_merged.pdf`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/${jobId}/result.pdf`;

  try {

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const isHealthy = await healthCheck();
        if (isHealthy) break;
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      } catch (error) {
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (retryCount > maxRetries) {
      throw ApiError.serviceUnavailable("Unable to establish Redis connection");
    }


    await updateJobStatus(jobId, 'queued', 0, {
      createdAt: new Date().toISOString(),
      operation: 'merge',
      filesCount: s3Keys.length,
      originalFileNames: originalFileNames || []
    });


    await pdfProcessingQueue.add('merge-pdfs', {
      jobId,
      operation: 'merge',
      s3Keys,
      outputPath,
      outputS3Key,
      originalFileNames: originalFileNames || []
    }, { attempts: 3, backoff: { type: 'exponential', delay: 10000 } });

  } catch (error) {


    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue merge job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }

    throw ApiError.internal(`PDF merge operation failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your PDF merge job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'merge',
      filesCount: s3Keys.length,
      originalFileNames: originalFileNames || [],
      input: { bucket: s3Bucket, keys: s3Keys }
    }, "PDF merge job queued successfully", 200)
    .withRequest(req)
    .send(res);
});

export { mergePdfFiles };