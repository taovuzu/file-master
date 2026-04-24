import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { enqueueJob } from "../utils/queueJob.js";
import { SHARED_PROCESSED_PATH } from "../constants.js";

const fontSizes = {
  small: 10,
  normal: 12,
  large: 16
};

const marginSizes = {
  small: 10,
  normal: 20,
  large: 30
};

const fontChoices = {
  Arial: "Helvetica",
  "Times New Roman": "TimesRoman",
  Courier: "Courier"
};

const AddPageNumber = asyncHandler(async (req, res) => {
  const { s3Key, originalFileName } = req.body || {};
  if (!s3Key) throw ApiError.badRequest("Missing s3Key. Upload the file to S3 first.");

  let {
    pageMode, firstPageCover, position, margin, firstNumber,
    fromPage, toPage, textStyle,
    fontFamily = "Arial", fontSize = "normal", textColor = [0, 0, 0]
  } = req.body;

  const name = path.basename(originalFileName || "file.pdf", path.extname(originalFileName || "file.pdf"));
  const outputName = `${uuidv4()}___${name}_numbered.pdf`;
  fs.mkdirSync(SHARED_PROCESSED_PATH, { recursive: true });
  const outputPath = path.join(SHARED_PROCESSED_PATH, outputName);
  const outputS3Key = `processed/placeholder/result.pdf`;

  return enqueueJob({
    queueName: 'add-page-numbers',
    operation: 'addPageNumbers',
    jobData: {
      s3Key, outputPath, outputS3Key,
      pageMode, firstPageCover, position, margin, firstNumber,
      fromPage, toPage, textStyle, fontFamily, fontSize, textColor,
      originalFileName: originalFileName || "file.pdf"
    },
    statusMeta: {
      originalFileName: originalFileName || "file.pdf",
      pageMode, position, margin, firstNumber, fromPage, toPage, textStyle, fontFamily, fontSize
    },
    responseMeta: {
      originalFileName: originalFileName || "file.pdf",
      pageMode, position, margin, firstNumber, fromPage, toPage, textStyle, fontFamily, fontSize
    },
    successMessage: 'PDF page numbering job queued successfully',
    req, res,
  });
});

export { AddPageNumber };