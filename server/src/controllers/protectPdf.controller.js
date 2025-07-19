import { exec } from "child_process";
import path from "path";
import fs from "fs";

import { v4 as uuidv4 } from 'uuid';

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { GS_PATH } from "../constants.js";

const protectPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if(!file) {
    throw new ApiError(404, "File could not be found on server");
  }

  const password = req.body.PASSWORD;

  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_protected.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  const gsCmd = [
    GS_PATH,
    "-q",
    "-dNOPAUSE",
    "-dBATCH",
    "-sDEVICE=pdfwrite",
    `-sOutputFile="${outputPath}"`,
    "-dEncryptionR=3",
    `-sOwnerPassword=${password}`,
    `-sUserPassword=${password}`,
    `"${inputPath}"`
  ].join(" ");

  exec(gsCmd, (error, stdout, stderr) => {
    fs.unlinkSync(inputPath);

    console.log(stderr, stdout);
    if (error) {
      throw new ApiError(400, "Error while protecting pdf file", error);;
    }

    return res.status(200).json(
      new ApiResponse(200, "PDF protected successfully", {
        file: `${outputName}`
      })
    );
  });
});

export { protectPdf };