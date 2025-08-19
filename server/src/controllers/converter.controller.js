import { exec } from "child_process";
import path from "path";
import fs from "fs";

import { v4 as uuidv4 } from "uuid";
import { PDFDocument, PageSizes } from "pdf-lib";
import archiver from "archiver";
import pptxgen from "pptxgenjs";
import pdf from "pdf-poppler";
import { imageSizeFromFile } from 'image-size/fromFile'

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
  const outputDir = path.join("public", "processed");
  // const outputPath = path.join(outputDir, outputName);

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
        file: `${outputName}`
      })
    );
  });
});

const convertImagesToPdf = asyncHandler(async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) {
    throw new ApiError(404, "No files were uploaded.");
  }

  const {
    orientation = "portrait",
    pagetype = "A4",
    margin = "none",
    mergeImagesInOnePdf = true,
  } = req.body;

  const outputDir = path.join(process.cwd(), "public", "processed");

  const marginMap = {
    none: 0,
    small: 20,
    big: 40,
  };
  const marginValue = marginMap[margin] ?? 0;

  const getBasePageSize = () => {
    if (pagetype === "UsLetter") return PageSizes.Letter;
    if (pagetype === "A4") return PageSizes.A4;
    return null;
  };

  const calculatePageSize = (imgWidth, imgHeight) => {
    let pageSize;

    if (pagetype === "Fit") {
      pageSize = [imgWidth + 2 * marginValue, imgHeight + 2 * marginValue];
    } else {
      pageSize = getBasePageSize();
    }

    if (orientation === "landscape" && pageSize[1] > pageSize[0]) {
      pageSize = [pageSize[1], pageSize[0]];
    } else if (orientation === "portrait" && pageSize[0] > pageSize[1]) {
      pageSize = [pageSize[1], pageSize[0]];
    }

    return pageSize;
  };

  const scaleImageToFitPage = (img, pageSize) => {
    let drawWidth = img.width;
    let drawHeight = img.height;

    const maxWidth = pageSize[0] - 2 * marginValue;
    const maxHeight = pageSize[1] - 2 * marginValue;

    const widthRatio = maxWidth / img.width;
    const heightRatio = maxHeight / img.height;
    const scale = Math.min(widthRatio, heightRatio, 1);

    drawWidth = img.width * scale;
    drawHeight = img.height * scale;

    return { drawWidth, drawHeight };
  };

  if (mergeImagesInOnePdf === "true" || mergeImagesInOnePdf === true) {
    const pdfDoc = await PDFDocument.create();

    for (let file of files) {
      const imgBuffer = fs.readFileSync(file.path);
      const ext = path.extname(file.originalname).toLowerCase();

      let image;
      if (ext === ".jpg" || ext === ".jpeg") {
        image = await pdfDoc.embedJpg(imgBuffer);
      } else if (ext === ".png") {
        image = await pdfDoc.embedPng(imgBuffer);
      } else continue;

      const pageSize = calculatePageSize(image.width, image.height);
      const { drawWidth, drawHeight } = scaleImageToFitPage(image, pageSize);

      const page = pdfDoc.addPage(pageSize);
      page.drawImage(image, {
        x: (pageSize[0] - drawWidth) / 2,
        y: (pageSize[1] - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
      });

      fs.unlinkSync(file.path);
    }

    const name = path.basename(files[0].originalname, path.extname(files[0].originalname));
    const outputName = `${uuidv4()}___${name}.pdf`;
    const outputPath = path.join(outputDir, outputName);
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    return res.status(200).json(
      new ApiResponse(200, "Merged PDF from images successfully", {
        file: `${outputName}`,
      })
    );
  } else {
    const baseOutDir = path.join(outputDir, `image_to_pdf___${uuidv4()}`);
    fs.mkdirSync(baseOutDir, { recursive: true });
    for (let file of files) {
      const imgBuffer = fs.readFileSync(file.path);
      const ext = path.extname(file.originalname).toLowerCase();

      let image;
      const pdfDoc = await PDFDocument.create();

      if (ext === ".jpg" || ext === ".jpeg") {
        image = await pdfDoc.embedJpg(imgBuffer);
      } else if (ext === ".png") {
        image = await pdfDoc.embedPng(imgBuffer);
      } else continue;

      const pageSize = calculatePageSize(image.width, image.height);
      const { drawWidth, drawHeight } = scaleImageToFitPage(image, pageSize);

      const page = pdfDoc.addPage(pageSize);
      page.drawImage(image, {
        x: (pageSize[0] - drawWidth) / 2,
        y: (pageSize[1] - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
      });

      const name = path.basename(file.originalname, path.extname(file.originalname));
      const outPath = path.join(baseOutDir, `${uuidv4()}___${name}.pdf`);
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outPath, pdfBytes);
      fs.unlinkSync(file.path);
    }

    const zipName = `${uuidv4()}___image_to_pdf.zip`;
    const zipPath = path.join(outputDir, zipName);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 2 } });

    archive.on("error", (err) => { throw new ApiError(500, err); });
    archive.pipe(output);
    archive.directory(baseOutDir, false);
    await archive.finalize();

    fs.rm(baseOutDir, { recursive: true, force: true }, (err) => {
      if (err) console.error(`Error deleting temp dir: ${err}`);
    });

    return res.status(200).json(
      new ApiResponse(200, "Images converted to individual PDFs and zipped", {
        file: `${zipPath}`,
      })
    );
  }
});

const convertPdfToPptx = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(400, "File does not found");
  }

  const inputPath = path.resolve(file.path);
  const name = path.basename(inputPath, path.extname(file.originalname));
  const outputName = `${name}.pptx`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  const baseOutDir = path.join(process.cwd(), "public", "temp", `pdf_to_image_${uuidv4()}`);
  fs.mkdirSync(baseOutDir, { recursive: true });

  const options = {
    format: 'png',
    out_dir: baseOutDir,
    out_prefix: 'slide',
    page: null,
  };

  await pdf.convert(inputPath, options);
  fs.unlinkSync(inputPath);

  const imageFiles = fs.readdirSync(baseOutDir).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (imageFiles.length == 0) {
    throw new ApiError(400, "no image was generated from pdf");
  }
  const dimensions = await imageSizeFromFile(path.join(baseOutDir, imageFiles[0]));
  const slideWidth = dimensions.width / 72;
  const slideHeight = dimensions.height / 72;

  const pptx = new pptxgen();
  pptx.defineLayout({ name: 'customLayout', width: slideWidth, height: slideHeight });
  pptx.layout = 'customLayout';

  for (let i = 0; i < imageFiles.length; i++) {
    const imagePath = path.join(baseOutDir, imageFiles[i]);
    const slide = pptx.addSlide();
    slide.addImage({ path: imagePath, x: 0, y: 0, w: slideWidth, h: slideHeight });
  }

  await pptx.writeFile({ fileName: outputPath });
  fs.rm(baseOutDir, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error deleting directory: ${err}`);
    } else {
      console.log(`Directory and its contents deleted: ${baseOutDir}`);
    }
  });

  return res.status(200).json(
    new ApiResponse(200, 'pdf converted successfully to pptx', {
      file: `${outputPath}`
    })
  );
});

export { convertDocToPdf, convertImagesToPdf, convertPdfToPptx };