import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enqueueJob } from "../utils/queueJob.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";

const addTextWatermark = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  if (!s3Key) throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");

  let {
    text, position = "bottom-right", transparency = 0.5, rotation = 0,
    layer = "overlay", fromPage = 1, toPage = 1,
    fontFamily = "Arial", fontSize = "normal", textColor = [0, 0, 0]
  } = req.body;

  if (!text) throw ApiError.badRequest("Text is required for watermark");

  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_watermarked.pdf`;
  if (!fs.existsSync(SHARED_PROCESSED_PATH)) fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.pdf`;

  return enqueueJob({
    queueName: 'add-text-watermark',
    operation: 'addTextWatermark',
    jobData: {
      s3Key, outputPath, outputS3Key, text, position, transparency, rotation,
      layer, fromPage, toPage, fontFamily, fontSize, textColor,
      originalFileName: originalFileName || "file.pdf"
    },
    statusMeta: {
      originalFileName: originalFileName || "file.pdf", text, position, transparency,
      rotation, fromPage, toPage, fontFamily, fontSize
    },
    responseMeta: {
      originalFileName: originalFileName || "file.pdf", text, position, transparency,
      rotation, fromPage, toPage, fontFamily, fontSize
    },
    successMessage: 'PDF text watermark job queued successfully',
    req, res,
  });
});

const addImageWatermark = asyncHandler(async (req, res) => {
  const { pdfS3Key, imageS3Key, originalFileName } = req.body || {};
  if (!pdfS3Key || !imageS3Key) {
    throw ApiError.badRequest("Missing pdfS3Key or imageS3Key. Upload both files to S3 first.");
  }

  let {
    position = "bottom-right", transparency = 0.5, rotation = 0,
    layer = "overlay", fromPage = 1, toPage = 1, scale = 1
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

  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_watermarked.pdf`;
  if (!fs.existsSync(SHARED_PROCESSED_PATH)) fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.pdf`;

  return enqueueJob({
    queueName: 'add-image-watermark',
    operation: 'addImageWatermark',
    jobData: {
      pdfS3Key, imageS3Key, outputPath, outputS3Key,
      position, transparency, rotation, layer,
      fromPage: fromPageIndex, toPage: toPageIndex, scale,
      originalFileName: originalFileName || "file.pdf"
    },
    statusMeta: {
      originalFileName: originalFileName || "file.pdf",
      position, transparency, rotation, fromPage, toPage, scale
    },
    responseMeta: {
      originalFileName: originalFileName || "file.pdf",
      position, transparency, rotation, fromPage, toPage, scale
    },
    successMessage: 'PDF image watermark job queued successfully',
    req, res,
  });
});

export { addTextWatermark, addImageWatermark };