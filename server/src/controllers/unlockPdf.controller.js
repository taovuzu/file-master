import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { GS_PATH } from "../constants.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";

const unlockPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if(!file) {
    throw new ApiError(404, "File could not be found on server");
  }

  const password = req.body.PASSWORD;

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_unlocked.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  let retryCount = 0;
  const maxRetries = 3;
  while (retryCount < maxRetries) {
    try {
      const isHealthy = await healthCheck();
      if (isHealthy) break;
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    } catch (error) {
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
  if (retryCount > maxRetries) throw new ApiError(500, "Unable to establish Redis connection");

  await updateJobStatus(jobId, 'queued', 0);
  await pdfProcessingQueue.add('unlock-pdf', {
    jobId,
    operation: 'unlock',
    inputPath,
    outputPath,
    password,
    originalFileName: file.originalname
  });

  return res.status(200).json(
    new ApiResponse(200, "PDF unlock job queued successfully", {
      jobId,
      message: "Your PDF unlock job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/pdf-tools/status/${jobId}`,
      downloadUrl: `/api/v1/pdf-tools/download/${jobId}`
    })
  );
});

export { unlockPdf };