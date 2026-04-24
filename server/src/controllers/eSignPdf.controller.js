import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enqueueJob } from "../utils/queueJob.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";

const eSignPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw ApiError.notFound("File could not be found on server");

  const {
    signatureText,
    signatureImage,
    position = "bottom-right",
    page = 1,
    x = 100,
    y = 100,
    width = 200,
    height = 100
  } = req.body;

  if (!signatureText && !signatureImage) {
    throw ApiError.badRequest("Either signature text or signature image is required");
  }

  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_signed.pdf`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);

  return enqueueJob({
    queueName: 'e-sign-pdf',
    operation: 'eSignPdf',
    jobData: { inputPath, outputPath, signatureText, signatureImage, position, page, x, y, width, height, originalFileName: file.originalname },
    statusMeta: { originalFileName: file.originalname, signatureText, position, page, x, y, width, height },
    responseMeta: { originalFileName: file.originalname, signatureText, position, page, x, y, width, height },
    successMessage: 'PDF e-signature job queued successfully',
    req, res,
  });
});

export { eSignPdf };