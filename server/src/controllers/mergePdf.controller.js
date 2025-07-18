import path from "path";
import fs from "fs";

import { v4 as uuidv4 } from "uuid";
import PDFMerger from "pdf-merger-js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const mergePdfFiles = asyncHandler(async (req, res) => {
  const files = req.files; 
  if (!files || files.length === 0) {
    throw new ApiError(404, "No files were uploaded.");
  }

  const outputName = `${uuidv4()}___file_master_merged.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const merger = new PDFMerger();

  for (let i = 0; i < files.length; i++) {
    await merger.add(files[i].path); 
  }

  await merger.setMetadata({
    producer: "file_master",
    author: "file_master",
    creator: "file_master",
    title: "file_master_merged",
  });

  const pdfBuffer = await merger.saveAsBuffer();
  fs.writeFileSync(outputPath, pdfBuffer);

  for (let i = 0; i < files.length; i++) {
    fs.unlinkSync(files[i].path);
  }

  return res.status(200).json(
    new ApiResponse(200, "PDFs merged successfully", {
      file: outputName,
    })
  );
});

export { mergePdfFiles };
