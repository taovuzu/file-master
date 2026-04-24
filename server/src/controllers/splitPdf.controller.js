import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enqueueJob } from "../utils/queueJob.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";
import { s3Bucket } from "../utils/s3.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const splitPdf = asyncHandler(async (req, res) => {
  const { s3Key, ranges, originalFileName } = req.body || {};
  if (!s3Key) throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");

  let parsedRanges = ranges;
  if (typeof ranges === 'string') {
    try {
      const parsed = JSON.parse(ranges);
      parsedRanges = parsed.ranges || parsed;
    } catch (err) {
      throw ApiError.badRequest('Invalid ranges format');
    }
  } else if (typeof ranges === 'object' && ranges !== null) {
    if (ranges.ranges && Array.isArray(ranges.ranges)) {
      parsedRanges = ranges.ranges;
    } else if (Array.isArray(ranges)) {
      parsedRanges = ranges;
    } else {
      throw ApiError.badRequest('Invalid ranges format - expected array or object with ranges property');
    }
  } else if (!Array.isArray(ranges)) {
    throw ApiError.badRequest('Ranges must be an array or object');
  }

  if (!Array.isArray(parsedRanges) || parsedRanges.length === 0) {
    throw ApiError.badRequest('At least one page range is required');
  }

  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const isSingleRange = parsedRanges.length === 1;
  const fileExtension = isSingleRange ? 'pdf' : 'zip';
  const outputName = `${uuidv4()}___${name}_splited.${fileExtension}`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.${fileExtension}`;

  return enqueueJob({
    queueName: 'split-pdf',
    operation: 'split',
    jobData: {
      s3Key, outputPath, outputS3Key, outputDir: SHARED_PROCESSED_PATH,
      name, ranges: parsedRanges, originalFileName: originalFileName || "file.pdf",
      isSingleRange, fileExtension
    },
    statusMeta: { originalFileName: originalFileName || "file.pdf", ranges: parsedRanges, isSingleRange, fileExtension },
    responseMeta: { originalFileName: originalFileName || "file.pdf", ranges: parsedRanges, input: { bucket: s3Bucket, key: s3Key } },
    successMessage: 'PDF split job queued successfully',
    queueOptions: { attempts: 3, backoff: { type: 'exponential', delay: 10000 } },
    req, res,
  });
});

export { splitPdf };