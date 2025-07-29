import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";

const convertDocToPdf = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  
  if (!s3Key) {
    throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");
  }

  const jobId = uuidv4();
  const name = path.basename(originalFileName || "file", path.extname(originalFileName || "file"));
  const outputName = `${uuidv4()}___${name}.pdf`;
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
      operation: 'convertDocToPdf',
      originalFileName: originalFileName || "file"
    });

    await pdfProcessingQueue.add('convert-doc-to-pdf', {
      jobId,
      operation: 'convertDocToPdf',
      s3Key,
      outputPath,
      outputS3Key,
      outputName,
      outputDir: SHARED_PROCESSED_PATH,
      originalFileName: originalFileName || "file"
    });

  } catch (error) {


    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue doc to pdf conversion job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }

    throw ApiError.internal(`Conversion failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your document conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'convertDocToPdf',
      originalFileName: originalFileName || "file"
    }, 'Document conversion job queued successfully', 200)
    .withRequest(req)
    .send(res);
});

const convertImagesToPdf = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    throw ApiError.notFound("No files were uploaded.");
  }

  const {
    orientation = "portrait",
    pagetype = "A4",
    margin = "none",
    mergeImagesInOnePdf = true
  } = req.body;
  

  const jobId = uuidv4();
  let outputName = `${uuidv4()}___images_converted.zip`;
  if (mergeImagesInOnePdf === "true" || mergeImagesInOnePdf === true) outputName = `${uuidv4()}___images_converted.pdf`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/${jobId}/result${mergeImagesInOnePdf === "true" || mergeImagesInOnePdf === true ? '.pdf' : '.zip'}`;

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
      operation: 'convertImagesToPdf',
      originalFileNames: files.map((f) => f.originalname),
      orientation,
      pagetype,
      margin,
      mergeImagesInOnePdf
    });

    await pdfProcessingQueue.add('convert-images-to-pdf', {
      jobId,
      operation: 'convertImagesToPdf',
      files,
      outputPath,
      outputS3Key,
      orientation,
      pagetype,
      margin,
      mergeImagesInOnePdf,
      originalFileNames: files.map((f) => f.originalname)
    });

  } catch (error) {
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue images to pdf conversion job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }
    throw ApiError.internal(`Conversion failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your image conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'convertImagesToPdf',
      originalFileNames: files.map((f) => f.originalname),
      orientation,
      pagetype,
      margin,
      mergeImagesInOnePdf
    }, 'Image conversion job queued successfully', 200)
    .withRequest(req)
    .send(res);
});

const convertPdfToDoc = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  
  if (!s3Key) {
    throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");
  }

  const jobId = uuidv4();
  const name = path.basename(originalFileName || "file", path.extname(originalFileName || "file"));
  const outputName = `${uuidv4()}___${name}.docx`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/${jobId}/result.docx`;

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
      operation: 'convertPdfToDoc',
      originalFileName: originalFileName || "file.pdf"
    });

    await pdfProcessingQueue.add('convert-pdf-to-doc', {
      jobId,
      operation: 'convertPdfToDoc',
      s3Key,
      outputPath,
      outputS3Key,
      originalFileName: originalFileName || "file.pdf"
    });

  } catch (error) {


    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue pdf to doc conversion job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }

    throw ApiError.internal(`Conversion failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your PDF to DOC conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'convertPdfToDoc',
      originalFileName: originalFileName || "file.pdf"
    }, 'PDF to DOC conversion job queued successfully', 200)
    .withRequest(req)
    .send(res);
});

const convertPdfToPpt = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  
  if (!s3Key) {
    throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");
  }

  const jobId = uuidv4();
  const name = path.basename(originalFileName || "file", path.extname(originalFileName || "file"));
  const outputName = `${uuidv4()}___${name}.pptx`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/${jobId}/result.pptx`;

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
      operation: 'convertPdfToPpt',
      originalFileName: originalFileName || "file.pdf"
    });

    await pdfProcessingQueue.add('convert-pdf-to-ppt', {
      jobId,
      operation: 'convertPdfToPpt',
      s3Key,
      outputPath,
      outputS3Key,
      originalFileName: originalFileName || "file.pdf"
    });

  } catch (error) {


    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue pdf to ppt conversion job',
        error: error.stack,
        failedAt: new Date().toISOString()
      });
    } catch (redisError) {
    }

    throw ApiError.internal(`Conversion failed: ${error.message}`);
  }

  return ApiResponse
    .success({
      jobId,
      message: "Your PDF to PPT conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'convertPdfToPpt',
      originalFileName: originalFileName || "file.pdf"
    }, 'PDF to PPT conversion job queued successfully', 200)
    .withRequest(req)
    .send(res);
});

export { convertDocToPdf, convertImagesToPdf, convertPdfToDoc, convertPdfToPpt };