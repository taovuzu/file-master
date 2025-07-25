import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";

const fontSizes = {
  small: 10,
  normal: 12,
  large: 16
};

const marginSizes = {
  small: 10,
  normal: 20,
  large: 30
};

const fontChoices = {
  Arial: "Helvetica",
  "Times New Roman": "TimesRoman",
  Courier: "Courier"
};

const AddPageNumber = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  
  if (!s3Key) {
    throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");
  }

  let {
    pageMode,
    firstPageCover,
    position,
    margin,
    firstNumber,
    fromPage,
    toPage,
    textStyle,
    fontFamily = "Arial",
    fontSize = "normal",
    textColor = [0, 0, 0]
  } = req.body;

  const jobId = uuidv4();
  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_numbered.pdf`;
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
      operation: 'addPageNumbers',
      originalFileName: originalFileName || "file.pdf",
      pageMode,
      position,
      margin,
      firstNumber,
      fromPage,
      toPage,
      textStyle,
      fontFamily,
      fontSize
    });


    await pdfProcessingQueue.add('add-page-numbers', {
      jobId,
      operation: 'addPageNumbers',
      s3Key,
      outputPath,
      outputS3Key,
      pageMode,
      firstPageCover,
      position,
      margin,
      firstNumber,
      fromPage,
      toPage,
      textStyle,
      fontFamily,
      fontSize,
      textColor,
      originalFileName: originalFileName || "file.pdf"
    });

  } catch (error) {


    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue page numbering job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }

    throw ApiError.internal(`Page numbering operation failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your PDF page numbering job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'addPageNumbers',
      originalFileName: originalFileName || "file.pdf",
      pageMode,
      position,
      margin,
      firstNumber,
      fromPage,
      toPage,
      textStyle,
      fontFamily,
      fontSize
    }, "PDF page numbering job queued successfully", 200)
    .withRequest(req)
    .send(res);
});

export { AddPageNumber };