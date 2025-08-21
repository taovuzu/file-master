import path from "path";
import fs from "fs";

import { v4 as uuidv4 } from "uuid";
import { PDFDocument } from "pdf-lib";
import archiver from "archiver";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const splitPdf = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(404, "File could not be found on server");
  }

  let { ranges } = req.body;

  if (typeof ranges === 'string') {
    try {
      ranges = JSON.parse(ranges);
      ranges = ranges.ranges;
    } catch (err) {
      throw new ApiError(400, 'Invalid ranges format');
    }
  }

  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_splited.zip`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);
  const baseOutDir = path.join(process.cwd(), "public", "processed", `split___${uuidv4()}`);
  fs.mkdirSync(baseOutDir, { recursive: true });

  const uint8Array = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(uint8Array);
  const numberOfPages = pdfDoc.getPages().length;

  let outputPaths = [];
  console.log(ranges, ranges.length);

  for (let i = 0; i < ranges.length; i++) {
    console.log(typeof ranges[i]);
    console.log(ranges[i]);
    let [start, end] = ranges[i].map(Number);
    if (start < 1 || end < start) {
      continue;
    }

    const actualEnd = Math.min(end, numberOfPages);
    const idxs = Array.from({ length: actualEnd - start + 1 }, (_, i) => start - 1 + i);
    const subDocument = await PDFDocument.create();
    const pages = await subDocument.copyPages(pdfDoc, idxs);
    pages.forEach((p) => subDocument.addPage(p));

    const subDocumentOutName = `${name}-splited-${start}-${actualEnd}.pdf`;
    const subDocumentOutPath = path.join(baseOutDir, subDocumentOutName);
    const pdfBytes = await subDocument.save();
    fs.writeFileSync(subDocumentOutPath, pdfBytes);

    outputPaths.push(subDocumentOutPath);
  }

  fs.unlinkSync(file.path);

  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", {
    zlib: { level: 2 },
  });


  archive.on("error", (err) => { throw new ApiError(500, err) });

  archive.pipe(output);
  archive.directory(baseOutDir, false);
  await archive.finalize();

  fs.rm(baseOutDir, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error deleting directory: ${err}`);
    } else {
      console.log(`Directory and its contents deleted: ${baseOutDir}`);
    }
  });

  return res.status(200)
    .json(
      new ApiResponse(200, "PDFs split successfully", {
        file: `${outputName}`
      })
    );
});


export { splitPdf };