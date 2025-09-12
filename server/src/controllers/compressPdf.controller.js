import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { GS_PATH } from "../constants.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";

const compressPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError.notFound("File could not be found on server");
  }

  let compressionLevel = req.body.compressionLevel;
  if (!compressionLevel) compressionLevel = "ebook";else
  if (compressionLevel == 1) compressionLevel = "printer";else
  if (compressionLevel == 2) compressionLevel = "ebook";else
  compressionLevel = "screen";

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_compressed.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

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
      operation: 'compress',
      originalFileName: file.originalname
    });


    await pdfProcessingQueue.add('compress-pdf', {
      jobId,
      operation: 'compress',
      inputPath,
      outputPath,
      compressionLevel,
      originalFileName: file.originalname
    });

  } catch (error) {
    console.error(`Failed to queue compress job ${jobId}:`, error);


    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue compress job',
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
      message: "Your PDF compression job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'compress',
      compressionLevel,
      originalFileName: file.originalname
    }, "PDF compression job queued successfully", 200)
    .withRequest(req)
    .send(res);
});

export { compressPdf };