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
    throw new ApiError(404, "No files were uploaded.");
  }

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(inputPath, path.extname(file.originalname));
  const outputName = `${name}.pdf`;
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
  await pdfProcessingQueue.add('convert-doc-to-pdf', {
    jobId,
    operation: 'convertDocToPdf',
    inputPath,
    outputName,
    outputDir,
    outputPath,
    originalFileName: file.originalname
  });

  return res.status(200).json(
    new ApiResponse(200, 'Document conversion job queued successfully', {
      jobId,
      message: "Your document conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/pdf-tools/status/${jobId}`,
      downloadUrl: `/api/v1/pdf-tools/download/${jobId}`
    })
  );
});

const convertImagesToPdf = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    throw new ApiError(404, "No files were uploaded.");
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

  return res.status(200).json(
    new ApiResponse(200, 'Image conversion job queued successfully', {
      jobId,
      message: "Your image conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/pdf-tools/status/${jobId}`,
      downloadUrl: `/api/v1/pdf-tools/download/${jobId}`
    })
  );
});

const convertPdfToDoc = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(404, "No files were uploaded.");
  }

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(inputPath, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}.docx`;
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
  await pdfProcessingQueue.add('convert-pdf-to-doc', {
    jobId,
    operation: 'convertPdfToDoc',
    inputPath,
    outputPath,
    originalFileName: file.originalname
  });

  return res.status(200).json(
    new ApiResponse(200, 'PDF to DOC conversion job queued successfully', {
      jobId,
      message: "Your PDF to DOC conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/pdf-tools/status/${jobId}`,
      downloadUrl: `/api/v1/pdf-tools/download/${jobId}`
    })
  );
});

const convertPdfToPpt = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(404, "No files were uploaded.");
  }

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(inputPath, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}.pptx`;
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
  await pdfProcessingQueue.add('convert-pdf-to-ppt', {
    jobId,
    operation: 'convertPdfToPpt',
    inputPath,
    outputPath,
    originalFileName: file.originalname
  });

  return res.status(200).json(
    new ApiResponse(200, 'PDF to PPT conversion job queued successfully', {
      jobId,
      message: "Your PDF to PPT conversion job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/pdf-tools/status/${jobId}`,
      downloadUrl: `/api/v1/pdf-tools/download/${jobId}`
    })
  );
});

export { convertDocToPdf, convertImagesToPdf, convertPdfToDoc, convertPdfToPpt };