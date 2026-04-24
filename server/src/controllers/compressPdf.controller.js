import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enqueueJob } from "../utils/queueJob.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";
import { s3Bucket } from "../utils/s3.js";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import fs from "fs";

const compressPdf = asyncHandler(async (req, res) => {
  const { s3Key, compressionLevel: compressionLevelRaw, originalFileName } = req.body || {};
  if (!s3Key) throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");

  let compressionLevel = compressionLevelRaw;
  if (!compressionLevel) compressionLevel = "ebook";
  else if (compressionLevel == 1) compressionLevel = "printer";
  else if (compressionLevel == 2) compressionLevel = "ebook";
  else compressionLevel = "screen";

  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_compressed.pdf`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.pdf`;

  return enqueueJob({
    queueName: 'compress-pdf',
    operation: 'compress',
    jobData: { s3Key, outputPath, outputS3Key, compressionLevel, originalFileName: originalFileName || "file.pdf" },
    statusMeta: { originalFileName: originalFileName || "file.pdf" },
    responseMeta: { compressionLevel, originalFileName: originalFileName || "file.pdf", input: { bucket: s3Bucket, key: s3Key } },
    successMessage: 'PDF compression job queued successfully',
    queueOptions: { attempts: 3, backoff: { type: 'exponential', delay: 10000 } },
    req, res,
  });
});

export { compressPdf };