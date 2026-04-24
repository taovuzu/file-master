import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enqueueJob } from "../utils/queueJob.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const rotatePdf = asyncHandler(async (req, res) => {
  const { s3Key, angle, originalFileName } = req.body || {};
  if (!s3Key) throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");

  const rotationAngle = Number(angle);
  if (![1, 2, 3, -1, -2, -3].includes(rotationAngle)) {
    throw ApiError.badRequest("angle of rotation value should be one of 1, 2, 3, -1, -2 , -3");
  }

  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_rotated.pdf`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.pdf`;

  return enqueueJob({
    queueName: 'rotate-pdf',
    operation: 'rotate',
    jobData: { s3Key, outputPath, outputS3Key, angle: rotationAngle, originalFileName: originalFileName || "file.pdf" },
    statusMeta: { originalFileName: originalFileName || "file.pdf", angle: rotationAngle },
    responseMeta: { angle: rotationAngle, originalFileName: originalFileName || "file.pdf" },
    successMessage: 'PDF rotation job queued successfully',
    req, res,
  });
});

export { rotatePdf };