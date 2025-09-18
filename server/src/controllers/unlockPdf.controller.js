import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { GS_PATH, SHARED_PROCESSED_PATH } from "../constants.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";

const unlockPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError.notFound("File could not be found on server");
  }

  const password = req.body.PASSWORD;
  if (!password) {
    throw new ApiError.badRequest("Password is required to unlock PDF");
  }

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_unlocked.pdf`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);

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
      throw new ApiError.serviceUnavailable("Unable to establish Redis connection");
    }


    await updateJobStatus(jobId, 'queued', 0, {
      createdAt: new Date().toISOString(),
      operation: 'unlock',
      originalFileName: file.originalname
    });


    await pdfProcessingQueue.add('unlock-pdf', {
      jobId,
      operation: 'unlock',
      inputPath,
      outputPath,
      password,
      originalFileName: file.originalname
    });

  } catch (error) {
    console.error(`Failed to queue unlock job ${jobId}:`, error);


    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue unlock job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
      console.error(`Failed to update job status for ${jobId}:`, redisError);
    }

    throw error;
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your PDF unlock job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'unlock',
      originalFileName: file.originalname
    }, "PDF unlock job queued successfully", 200)
    .withRequest(req)
    .send(res);
});

export { unlockPdf };