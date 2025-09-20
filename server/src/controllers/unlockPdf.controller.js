import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";

const unlockPdf = asyncHandler(async (req, res) => {
  const { s3Key, password, originalFileName } = req.body || {};
  if (!s3Key) {
    throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");
  }
  if (!password) {
    throw ApiError.badRequest("Password is required to unlock PDF");
  }

  const jobId = uuidv4();
  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_unlocked.pdf`;
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
      operation: 'unlock',
      originalFileName: originalFileName || "file.pdf"
    });

    await pdfProcessingQueue.add('unlock-pdf', {
      jobId,
      operation: 'unlock',
      s3Key,
      outputPath,
      outputS3Key,
      password,
      originalFileName: originalFileName || "file.pdf"
    });

  } catch (error) {
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue unlock job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }

    throw ApiError.internal(`PDF unlock operation failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your PDF unlock job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'unlock',
      originalFileName: originalFileName || "file.pdf"
    }, "PDF unlock job queued successfully", 200)
    .withRequest(req)
    .send(res);
});

export { unlockPdf };