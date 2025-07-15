import { exec } from "child_process";
import path from "path";
import fs from "fs";

import { v4 as uuidv4 } from 'uuid';

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { GS_PATH } from "../constants.js";

const compressPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if(!file) {
    throw new ApiError(404, "File could not be found on server");
  }
  let compressionLevel = req.body.compressionLevel;
  if (!compressionLevel) compressionLevel = "ebook";
  else if (compressionLevel == 1) compressionLevel = "printer";
  else if (compressionLevel == 2) compressionLevel = "ebook";
  else compressionLevel = "screen";

  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_compressed.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  const gsCmd = [
    GS_PATH,
    "-q",
    "-dNOPAUSE",
    "-dBATCH",
    "-sDEVICE=pdfwrite",
    `-dPDFSETTINGS=/${compressionLevel}`,
    "-dCompressFonts=true",
    "-dColorImageDownsampleType=/Average",
    "-dColorImageResolution=72",
    "-dGrayImageDownsampleType=/Average",
    "-dGrayImageResolution=72",
    "-dMonoImageDownsampleType=/Subsample",
    "-dMonoImageResolution=72",
    "-dAutoFilterColorImages=false",
    "-dColorImageFilter=/DCTEncode",
    "-dAutoFilterGrayImages=false",
    "-dGrayImageFilter=/DCTEncode",
    "-dDownsampleMonoImages=true",
    "-dCompatibilityLevel=1.4",
    `-sOutputFile="${outputPath}"`,
    `"${inputPath}"`
  ].join(" ");

  exec(gsCmd, (error, stdout, stderr) => {
    fs.unlinkSync(inputPath);

    if (error) {
      throw new ApiError(400, "Error while compressing pdf file", error);;
    }

    return res.status(200).json(
      new ApiResponse(200, "PDF compressed successfully", {
        file: `${outputName}`
      })
    );
  });
});

export { compressPdf }