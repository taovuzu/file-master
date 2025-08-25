import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";

const mergePdfFiles = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    throw new ApiError.notFound("No files were uploaded.");
  }

  const jobId = uuidv4();
  const outputName = `${uuidv4()}___file_master_merged.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  const inputPaths = files.map((file) => file.path);
  const originalFileNames = files.map((file) => file.originalname);

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
      operation: 'merge',
      filesCount: files.length,
      originalFileNames
    });


    await pdfProcessingQueue.add('merge-pdfs', {
      jobId,
      operation: 'merge',
      inputPaths,
      outputPath,
      originalFileNames
    });

  } catch (error) {
    console.error(`Failed to queue merge job ${jobId}:`, error);


    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue merge job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
      console.error(`Failed to update job status for ${jobId}:`, redisError);
    }

    throw error;
  }

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "PDF merge job queued successfully",
    data: {
      jobId,
      message: "Your PDF merge job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'merge',
      filesCount: files.length,
      originalFileNames
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

export { mergePdfFiles };