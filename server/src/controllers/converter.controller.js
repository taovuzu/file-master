import { exec } from "child_process";
import path from "path";
import fs from "fs";

import { v4 as uuidv4 } from "uuid";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { LIBRE_PATH } from "../constants.js";

const convertDocToPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(404, "No files were uploaded.");
  }

  const inputPath = path.resolve(file.path);
  const name = path.basename(inputPath, path.extname(file.originalname));
  const outputName = `${name}.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  const libreCmd = [
    LIBRE_PATH,
    "--headless",
    "--convert-to pdf",
    "--outdir",
    `"${outputDir}"`,
    `"${inputPath}"`
  ].join(" ");

  exec(libreCmd, (err, stdout, stderr) => {
    if (err || stderr) {
      fs.unlinkSync(inputPath);
      throw new ApiError(500, "Error converting file to PDF", err || stderr);
    }

    fs.unlinkSync(inputPath);

    return res.status(200).json(
      new ApiResponse(200, 'File converted successfully to PDF', {
        file: `${outputPath}`
      })
    );
  });
});

export { convertDocToPdf };
// , convertImagesToPdf, convertPdfToPptx, convertPdfToImage 
