import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enqueueJob } from "../utils/queueJob.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";

const convertDocToPdf = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  if (!s3Key) throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");

  const name = path.basename(originalFileName || "file", path.extname(originalFileName || "file"));
  const outputName = `${uuidv4()}___${name}.pdf`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.pdf`;

  return enqueueJob({
    queueName: 'convert-doc-to-pdf',
    operation: 'convertDocToPdf',
    jobData: { s3Key, outputPath, outputS3Key, outputName, outputDir: SHARED_PROCESSED_PATH, originalFileName: originalFileName || "file" },
    statusMeta: { originalFileName: originalFileName || "file" },
    responseMeta: { originalFileName: originalFileName || "file" },
    successMessage: 'Document conversion job queued successfully',
    req, res,
  });
});

const convertImagesToPdf = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) throw ApiError.notFound("No files were uploaded.");

  const {
    orientation = "portrait",
    pagetype = "A4",
    margin = "none",
    mergeImagesInOnePdf = true
  } = req.body;

  const isMerge = mergeImagesInOnePdf === "true" || mergeImagesInOnePdf === true;
  const ext = isMerge ? 'pdf' : 'zip';
  const outputName = `${uuidv4()}___images_converted.${ext}`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.${ext}`;

  return enqueueJob({
    queueName: 'convert-images-to-pdf',
    operation: 'convertImagesToPdf',
    jobData: {
      files, outputPath, outputS3Key, orientation, pagetype, margin, mergeImagesInOnePdf,
      originalFileNames: files.map((f) => f.originalname)
    },
    statusMeta: { originalFileNames: files.map((f) => f.originalname), orientation, pagetype, margin, mergeImagesInOnePdf },
    responseMeta: {
      originalFileNames: files.map((f) => f.originalname),
      orientation, pagetype, margin, mergeImagesInOnePdf
    },
    successMessage: 'Image conversion job queued successfully',
    req, res,
  });
});

const convertPdfToDoc = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  if (!s3Key) throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");

  const name = path.basename(originalFileName || "file", path.extname(originalFileName || "file"));
  const outputName = `${uuidv4()}___${name}.docx`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.docx`;

  return enqueueJob({
    queueName: 'convert-pdf-to-doc',
    operation: 'convertPdfToDoc',
    jobData: { s3Key, outputPath, outputS3Key, originalFileName: originalFileName || "file.pdf" },
    statusMeta: { originalFileName: originalFileName || "file.pdf" },
    responseMeta: { originalFileName: originalFileName || "file.pdf" },
    successMessage: 'PDF to DOC conversion job queued successfully',
    req, res,
  });
});

const convertPdfToPpt = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  if (!s3Key) throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");

  const name = path.basename(originalFileName || "file", path.extname(originalFileName || "file"));
  const outputName = `${uuidv4()}___${name}.pptx`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.pptx`;

  return enqueueJob({
    queueName: 'convert-pdf-to-ppt',
    operation: 'convertPdfToPpt',
    jobData: { s3Key, outputPath, outputS3Key, originalFileName: originalFileName || "file.pdf" },
    statusMeta: { originalFileName: originalFileName || "file.pdf" },
    responseMeta: { originalFileName: originalFileName || "file.pdf" },
    successMessage: 'PDF to PPT conversion job queued successfully',
    req, res,
  });
});

export { convertDocToPdf, convertImagesToPdf, convertPdfToDoc, convertPdfToPpt };