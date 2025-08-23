import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { StandardFonts } from "pdf-lib";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pdfProcessingQueue, updateJobStatus, healthCheck } from "../queues/pdf.queue.js";


const addTextWatermark = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new ApiError(404, "File could not be found on server");

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
    textColor = [0, 0, 0],
  } = req.body;

  const jobId = uuidv4();
  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_watermarked.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
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

  await pdfProcessingQueue.add('add-text-watermark', {
    jobId,
    operation: 'addTextWatermark',
    inputPath,
    outputPath,
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
    originalFileName: file.originalname
  });

  return res.status(200).json(
    new ApiResponse(200, "PDF text watermark job queued successfully", {
      jobId,
      message: "Your PDF watermark job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/pdf-tools/status/${jobId}`,
      downloadUrl: `/api/v1/pdf-tools/download/${jobId}`
    })
  );
});

const addImageWatermark = asyncHandler(async (req, res) => {
  const { pdfFile, imageFile } = req.files;
  if (!pdfFile || !imageFile) throw new ApiError(404, "Both PDF and image files are required");

  let {
    position = "bottom-right",
    transparency = 0.5,
    rotation = 0,
    layer = "overlay",
    fromPage = 1,
    toPage = 1,
    scale = 1,
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
  const pdfPath = path.resolve(pdfFile.path);
  const imagePath = path.resolve(imageFile.path);

  const name = path.basename(pdfFile.originalname, path.extname(pdfFile.originalname));
  const outputName = `${uuidv4()}___${name}_watermarked.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
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

  await pdfProcessingQueue.add('add-image-watermark', {
    jobId,
    operation: 'addImageWatermark',
    pdfPath,
    imagePath,
    outputPath,
    position,
    transparency,
    rotation,
    layer,
    fromPage: fromPageIndex,
    toPage: toPageIndex,
    scale,
    originalFileName: pdfFile.originalname
  });

  return res.status(200).json(
    new ApiResponse(200, "PDF image watermark job queued successfully", {
      jobId,
      message: "Your PDF image watermark job has been queued. Use the job ID to track progress.",
      statusUrl: `/api/v1/pdf-tools/status/${jobId}`,
      downloadUrl: `/api/v1/pdf-tools/download/${jobId}`
    })
  );
});

export { addTextWatermark, addImageWatermark };
