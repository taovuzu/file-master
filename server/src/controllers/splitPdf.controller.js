import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";
import { s3Bucket } from "../utils/s3.js";

const splitPdf = asyncHandler(async (req, res) => {
  const { s3Key, ranges, originalFileName } = req.body || {};
  
  if (!s3Key) {
    throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");
  }

  let parsedRanges = ranges;
  
  // Handle different input formats
  if (typeof ranges === 'string') {
    try {
      const parsed = JSON.parse(ranges);
      parsedRanges = parsed.ranges || parsed;
    } catch (err) {
      throw ApiError.badRequest('Invalid ranges format');
    }
  } else if (typeof ranges === 'object' && ranges !== null) {
    // Handle nested ranges object like { ranges: [[1,5], [3,8]] }
    if (ranges.ranges && Array.isArray(ranges.ranges)) {
      parsedRanges = ranges.ranges;
    } else if (Array.isArray(ranges)) {
      parsedRanges = ranges;
    } else {
      throw ApiError.badRequest('Invalid ranges format - expected array or object with ranges property');
    }
  } else if (!Array.isArray(ranges)) {
    throw ApiError.badRequest('Ranges must be an array or object');
  }
  
  // Validate ranges format
  if (!Array.isArray(parsedRanges) || parsedRanges.length === 0) {
    throw ApiError.badRequest('At least one page range is required');
  }
  

  const jobId = uuidv4();
  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_splited.zip`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/${jobId}/result.zip`;

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
    if (retryCount > maxRetries) throw ApiError.serviceUnavailable("Unable to establish Redis connection");


    await updateJobStatus(jobId, 'queued', 0, {
      createdAt: new Date().toISOString(),
      operation: 'split',
      originalFileName: originalFileName || "file.pdf",
      ranges: parsedRanges
    });


    await pdfProcessingQueue.add('split-pdf', {
      jobId,
      operation: 'split',
      s3Key,
      outputPath,
      outputS3Key,
      outputDir: SHARED_PROCESSED_PATH,
      name,
      ranges: parsedRanges,
      originalFileName: originalFileName || "file.pdf"
    }, { attempts: 3, backoff: { type: 'exponential', delay: 10000 } });

  } catch (error) {
    console.error(`Failed to queue split job ${jobId}:`, error);


    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue split job',
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
      message: "Your PDF split job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'split',
      originalFileName: originalFileName || "file.pdf",
      ranges: parsedRanges,
      input: { bucket: s3Bucket, key: s3Key }
    }, "PDF split job queued successfully", 200)
    .withRequest(req)
    .send(res);
});

export { splitPdf };