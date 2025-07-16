import path from "path";
import fs from "fs";

import { v4 as uuidv4 } from "uuid";
import { PDFDocument, degrees } from "pdf-lib";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const rotatePdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(404, "File could not be found on server");
  }

  const angle = Number(req.body.angle); // 1 -> 90 clockwise, 2 -> 180 clockwise, 3 -> 270 clockwise, 
  // -1 -> 90 antiClockwise, -2 -> 180 antiClockwise, -3 -> 270 antiClockwise
  if (![1, 2, 3, -1, -2, -3].includes(angle)) {
    throw new ApiError(404, "angle of rotation value should be one of 1, 2, 3, -1, -2 , -3")
  }

  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_rotated.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  const uint8Array = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(uint8Array);
  const numberOfPages = pdfDoc.getPages().length;

  const idxs = Array.from({ length: numberOfPages }, (_, i) => i);
  idxs.forEach(i => pdfDoc.getPages()[i].setRotation(degrees(angle * 90)));
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  fs.unlinkSync(file.path);

  return res.status(200)
    .json(
      new ApiResponse(200, "PDFs split successfully", {
        file: `${outputName}`
      })
    );
});


export { rotatePdf };