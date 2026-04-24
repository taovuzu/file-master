import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enqueueJob } from "../utils/queueJob.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";
import { s3Bucket } from "../utils/s3.js";
import { randomUUID } from "crypto";
import path from "path";
import * as fs from "fs/promises";

const mergePdfController = asyncHandler(async (req, res) => {
  const { s3Keys, originalFileNames } = req.body || {};
  if (!s3Keys || !Array.isArray(s3Keys) || s3Keys.length === 0) {
    throw ApiError.badRequest("Missing s3Keys. Upload the files to S3 first.");
  }

  const outputName = `${randomUUID()}__file_master_merged.pdf`;
  await fs.mkdir(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.pdf`;

  return enqueueJob({
    queueName: 'merge-pdfs',
    operation: 'merge',
    jobData: { s3Keys, outputPath, outputS3Key, originalFileNames: originalFileNames || [] },
    statusMeta: { filesCount: s3Keys.length, originalFileNames: originalFileNames || [] },
    responseMeta: { filesCount: s3Keys.length, originalFileNames: originalFileNames || [], input: { bucket: s3Bucket, keys: s3Keys } },
    successMessage: 'PDF merge job queued successfully',
    queueOptions: { attempts: 3, backoff: { type: 'exponential', delay: 10000 } },
    req, res,
  });
});

export { mergePdfController };