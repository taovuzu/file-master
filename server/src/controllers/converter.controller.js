import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";

const convertDocToPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError.notFound("No files were uploaded.");
  }

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(inputPath, path.extname(file.originalname));
  const outputName = `${name}.pdf`;
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
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      } catch (error) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    if (retryCount > maxRetries) {
      throw new ApiError.serviceUnavailable("Unable to establish Redis connection");
    }

    await updateJobStatus(jobId, 'queued', 0, {
      createdAt: new Date().toISOString(),
      operation: 'convertDocToPdf',
      originalFileName: file.originalname
    });

    await pdfProcessingQueue.add('convert-doc-to-pdf', {
      jobId,
      operation: 'convertDocToPdf',
      inputPath,
      outputName,
      outputDir,
      outputPath,
      originalFileName: file.originalname
    });

  } catch (error) {
    console.error(`Failed to queue doc to pdf conversion job ${jobId}:`, error);
    
    // Update job status to failed if job was created
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue doc to pdf conversion job',
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
    message: 'Document conversion job queued successfully',
    data: {
      jobId,
      message: "Your document conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'convertDocToPdf',
      originalFileName: file.originalname
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

const convertImagesToPdf = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    throw new ApiError.notFound("No files were uploaded.");
  }

  const {
    orientation = "portrait",
    pagetype = "A4",
    margin = "none",
    mergeImagesInOnePdf = true,
  } = req.body;

  const jobId = uuidv4();
  let outputName = `${uuidv4()}___images_converted.zip`;
  if (mergeImagesInOnePdf === "true" || mergeImagesInOnePdf === true) outputName = `${uuidv4()}___images_converted.pdf`;
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
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      } catch (error) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    if (retryCount > maxRetries) {
      throw new ApiError.serviceUnavailable("Unable to establish Redis connection");
    }

    await updateJobStatus(jobId, 'queued', 0, {
      createdAt: new Date().toISOString(),
      operation: 'convertImagesToPdf',
      originalFileNames: files.map(f => f.originalname),
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
      orientation,
      pagetype,
      margin,
      mergeImagesInOnePdf,
      originalFileNames: files.map(f => f.originalname)
    });

  } catch (error) {
    console.error(`Failed to queue images to pdf conversion job ${jobId}:`, error);
    
    // Update job status to failed if job was created
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue images to pdf conversion job',
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
    message: 'Image conversion job queued successfully',
    data: {
      jobId,
      message: "Your image conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'convertImagesToPdf',
      originalFileNames: files.map(f => f.originalname),
      orientation,
      pagetype,
      margin,
      mergeImagesInOnePdf
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

const convertPdfToDoc = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError.notFound("No files were uploaded.");
  }

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(inputPath, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}.docx`;
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
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      } catch (error) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    if (retryCount > maxRetries) {
      throw new ApiError.serviceUnavailable("Unable to establish Redis connection");
    }

    await updateJobStatus(jobId, 'queued', 0, {
      createdAt: new Date().toISOString(),
      operation: 'convertPdfToDoc',
      originalFileName: file.originalname
    });

    await pdfProcessingQueue.add('convert-pdf-to-doc', {
      jobId,
      operation: 'convertPdfToDoc',
      inputPath,
      outputPath,
      originalFileName: file.originalname
    });

  } catch (error) {
    console.error(`Failed to queue pdf to doc conversion job ${jobId}:`, error);
    
    // Update job status to failed if job was created
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue pdf to doc conversion job',
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
    message: 'PDF to DOC conversion job queued successfully',
    data: {
      jobId,
      message: "Your PDF to DOC conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'convertPdfToDoc',
      originalFileName: file.originalname
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

const convertPdfToPpt = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError.notFound("No files were uploaded.");
  }

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(inputPath, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}.pptx`;
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
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      } catch (error) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    if (retryCount > maxRetries) {
      throw new ApiError.serviceUnavailable("Unable to establish Redis connection");
    }

    await updateJobStatus(jobId, 'queued', 0, {
      createdAt: new Date().toISOString(),
      operation: 'convertPdfToPpt',
      originalFileName: file.originalname
    });

    await pdfProcessingQueue.add('convert-pdf-to-ppt', {
      jobId,
      operation: 'convertPdfToPpt',
      inputPath,
      outputPath,
      originalFileName: file.originalname
    });

  } catch (error) {
    console.error(`Failed to queue pdf to ppt conversion job ${jobId}:`, error);
    
    // Update job status to failed if job was created
    try {
      await updateJobStatus(jobId, 'failed', 0, {
        message: error.message || 'Failed to queue pdf to ppt conversion job',
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
    message: 'PDF to PPT conversion job queued successfully',
    data: {
      jobId,
      message: "Your PDF to PPT conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'convertPdfToPpt',
      originalFileName: file.originalname
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

export { convertDocToPdf, convertImagesToPdf, convertPdfToDoc, convertPdfToPpt };