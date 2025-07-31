import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";

const eSignPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw ApiError.notFound("File could not be found on server");
  }

  const {
    signatureText,
    signatureImage,
    position = "bottom-right",
    page = 1,
    x = 100,
    y = 100,
    width = 200,
    height = 100
  } = req.body;

  if (!signatureText && !signatureImage) {
    throw ApiError.badRequest("Either signature text or signature image is required");
  }

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_signed.pdf`;
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
      throw ApiError.serviceUnavailable("Unable to establish Redis connection");
    }


    await updateJobStatus(jobId, 'queued', 0, {
      createdAt: new Date().toISOString(),
      operation: 'eSignPdf',
      originalFileName: file.originalname,
      signatureText,
      position,
      page,
      x,
      y,
      width,
      height
    });


    await pdfProcessingQueue.add('e-sign-pdf', {
      jobId,
      operation: 'eSignPdf',
      inputPath,
      outputPath,
      signatureText,
      signatureImage,
      position,
      page,
      x,
      y,
      width,
      height,
      originalFileName: file.originalname
    });

  } catch (error) {
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue e-sign job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }

    throw ApiError.internal(`PDF e-signature operation failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your PDF e-signature job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'eSignPdf',
      originalFileName: file.originalname,
      signatureText,
      position,
      page,
      x,
      y,
      width,
      height
    }, "PDF e-signature job queued successfully", 200)
    .withRequest(req)
    .send(res);
});

export { eSignPdf };