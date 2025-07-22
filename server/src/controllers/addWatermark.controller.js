import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";

const addTextWatermark = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  if (!s3Key) {
    throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");
  }

  let {
    text,
    position = "bottom-right",
    transparency = 0.5,
    rotation = 0,
    layer = "overlay",
    fromPage = 1,
    toPage = 1,
    fontFamily = "Arial",
    fontSize = "normal",
    textColor = [0, 0, 0]
  } = req.body;

  if (!text) {
    throw ApiError.badRequest("Text is required for watermark");
  }

  const jobId = uuidv4();
  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_watermarked.pdf`;
  if (!fs.existsSync(SHARED_PROCESSED_PATH)) fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
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
      operation: 'addTextWatermark',
      originalFileName: originalFileName || "file.pdf",
      text,
      position,
      transparency,
      rotation,
      fromPage,
      toPage,
      fontFamily,
      fontSize
    });

    await pdfProcessingQueue.add('add-text-watermark', {
      jobId,
      operation: 'addTextWatermark',
      s3Key,
      outputPath,
      outputS3Key,
      text,
      position,
      transparency,
      rotation,
      layer,
      fromPage,
      toPage,
      fontFamily,
      fontSize,
      textColor,
      originalFileName: originalFileName || "file.pdf"
    });

  } catch (error) {
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue text watermark job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }
    throw ApiError.internal(`Watermark operation failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your PDF watermark job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'addTextWatermark',
      originalFileName: originalFileName || "file.pdf",
      text,
      position,
      transparency,
      rotation,
      fromPage,
      toPage,
      fontFamily,
      fontSize
    }, "PDF text watermark job queued successfully", 200)
    .withRequest(req)
    .send(res);
});

const addImageWatermark = asyncHandler(async (req, res) => {
  const { pdfS3Key, imageS3Key, originalFileName } = req.body || {};
  if (!pdfS3Key || !imageS3Key) {
    throw ApiError.badRequest("Missing pdfS3Key or imageS3Key. Upload both files to S3 first.");
  }
  let {
    position = "bottom-right",
    transparency = 0.5,
    rotation = 0,
    layer = "overlay",
    fromPage = 1,
    toPage = 1,
    scale = 1
  } = req.body;

  transparency = parseFloat(transparency);
  rotation = parseFloat(rotation);
  fromPage = parseInt(fromPage);
  toPage = parseInt(toPage);
  scale = parseFloat(scale);

  if (isNaN(transparency) || transparency < 0 || transparency > 1) transparency = 0.5;
  if (isNaN(rotation)) rotation = 0;
  if (isNaN(scale) || scale <= 0) scale = 1;

  const fromPageIndex = Math.max(0, Number(fromPage) - 1);
  const toPageIndex = Math.min(Number(toPage) - 1, 1000000);

  const jobId = uuidv4();
  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_watermarked.pdf`;
  if (!fs.existsSync(SHARED_PROCESSED_PATH)) fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
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
      operation: 'addImageWatermark',
      originalFileName: originalFileName || "file.pdf",
      position,
      transparency,
      rotation,
      fromPage,
      toPage,
      scale
    });

    await pdfProcessingQueue.add('add-image-watermark', {
      jobId,
      operation: 'addImageWatermark',
      pdfS3Key,
      imageS3Key,
      outputPath,
      outputS3Key,
      position,
      transparency,
      rotation,
      layer,
      fromPage: fromPageIndex,
      toPage: toPageIndex,
      scale,
      originalFileName: originalFileName || "file.pdf"
    });

  } catch (error) {
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue image watermark job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }

    throw ApiError.internal(`Watermark operation failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your PDF image watermark job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'addImageWatermark',
      originalFileName: originalFileName || "file.pdf",
      position,
      transparency,
      rotation,
      fromPage,
      toPage,
      scale
    }, "PDF image watermark job queued successfully", 200)
    .withRequest(req)
    .send(res);
});

export { addTextWatermark, addImageWatermark };