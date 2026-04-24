import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enqueueJob } from "../utils/queueJob.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import fs from "fs";

const unlockPdf = asyncHandler(async (req, res) => {
  const { s3Key, password, originalFileName } = req.body || {};
  if (!s3Key) throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");
  if (!password) throw ApiError.badRequest("Password is required to unlock PDF");

  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_unlocked.pdf`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.pdf`;

  return enqueueJob({
    queueName: 'unlock-pdf',
    operation: 'unlock',
    jobData: { s3Key, outputPath, outputS3Key, password, originalFileName: originalFileName || "file.pdf" },
    statusMeta: { originalFileName: originalFileName || "file.pdf" },
    responseMeta: { originalFileName: originalFileName || "file.pdf" },
    successMessage: 'PDF unlock job queued successfully',
    req, res,
  });
});

export { unlockPdf };