import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";

const fontSizes = {
  small: 10,
  normal: 12,
  large: 16,
};

const marginSizes = {
  small: 10,
  normal: 20,
  large: 30,
};

const fontChoices = {
  Arial: "Helvetica",
  "Times New Roman": "TimesRoman",
  Courier: "Courier",
};

const AddPageNumber = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError.notFound("File could not be found on server");
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
    textColor = [0, 0, 0],
  } = req.body;

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_numbered.pdf`;
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
  if (retryCount > maxRetries) throw new ApiError.serviceUnavailable("Unable to establish Redis connection");

  await updateJobStatus(jobId, 'queued', 0, {
    createdAt: new Date().toISOString(),
    operation: 'addPageNumbers',
    originalFileName: file.originalname,
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
    inputPath,
    outputPath,
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
    originalFileName: file.originalname
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "PDF page numbering job queued successfully",
    data: {
      jobId,
      message: "Your PDF page numbering job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/download/status/${jobId}`,
      downloadUrl: `/api/v1/download/${jobId}`,
      operation: 'addPageNumbers',
      originalFileName: file.originalname,
      pageMode,
      position,
      margin,
      firstNumber,
      fromPage,
      toPage,
      textStyle,
      fontFamily,
      fontSize
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

export { AddPageNumber };
