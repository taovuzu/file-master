import path from "path";
import fs from "fs";

import { v4 as uuidv4 } from "uuid";
import { PDFDocument, PDFImage, rgb, StandardFonts, degrees } from "pdf-lib";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const fontSizes = {
  small: 20,
  normal: 28,
  large: 36,
};

const fontChoices = {
  Arial: StandardFonts.Helvetica,
  "Times New Roman": StandardFonts.TimesRoman,
  Courier: StandardFonts.Courier,
};

const addTextWatermark = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new ApiError(404, "File could not be found on server");

  let {
    text,
    position = "bottom-right",
    transparency = 0.5,
    rotation = 0,
    layer = "overlay",
    fromPage = 1,
    toPage = 1,
    fontFamily = "Arial",
    fontSize = "normal",
    textColor = [0, 0, 0],
  } = req.body;

  const fromPageIndex = Math.max(0, Number(fromPage) - 1);
  const toPageIndex = Math.min(Number(toPage) - 1, 1000000);

  const fontSizeValue = fontSizes[fontSize] || fontSizes.normal;
  const marginValue = 16;

  if (
    !Array.isArray(textColor) ||
    textColor.length !== 3 ||
    textColor.some((c) => typeof c !== "number" || c < 0 || c > 1)
  ) {
    textColor = [0, 0, 0];
  }

  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_watermarked.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  const uint8Array = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(uint8Array);
  const numberOfPages = pdfDoc.getPages().length;

  if (toPageIndex >= numberOfPages) {
    throw new ApiError(400, "toPage exceeds total number of pages");
  }

  const fontName = fontChoices[fontFamily] || StandardFonts.Helvetica;
  const selectedFont = await pdfDoc.embedFont(fontName);

  const angle = isNaN(Number(rotation)) ? 0 : Number(rotation);
  const rotate = degrees(angle);

  const drawWatermark = (page, x, y) => {
    page.drawText(text, {
      x,
      y,
      opacity: transparency,
      rotate,
      size: fontSizeValue,
      font: selectedFont,
      color: rgb(...textColor),
      ...(layer === "overlay" ? { overlay: true } : {}),
    });
  };

  for (let i = fromPageIndex; i <= toPageIndex; i++) {
    const page = pdfDoc.getPages()[i];
    const { width, height } = page.getSize();
    const textWidth = selectedFont.widthOfTextAtSize(text, fontSizeValue);
    const textHeight = fontSizeValue;

    if (position === "mosaic") {
      const gapX = textWidth + 80;
      const gapY = textHeight + 50;
      for (let y = 0; y < height; y += gapY) {
        for (let x = 0; x < width; x += gapX) {
          drawWatermark(page, x, y);
        }
      }
    } else {
      let x = 0;
      let y = 0;

      switch (position) {
        case "top-left":
          x = marginValue;
          y = height - marginValue - textHeight;
          break;
        case "top-right":
          x = width - textWidth - marginValue;
          y = height - marginValue - textHeight;
          break;
        case "bottom-left":
          x = marginValue;
          y = marginValue;
          break;
        case "bottom-right":
          x = width - textWidth - marginValue;
          y = marginValue;
          break;
        case "center":
          x = (width - textWidth) / 2;
          y = (height - textHeight) / 2;
          break;
        case "left-center":
          x = marginValue;
          y = (height - textHeight) / 2;
          break;
        case "right-center":
          x = width - textWidth - marginValue;
          y = (height - textHeight) / 2;
          break;
        case "top-center":
          x = (width - textWidth) / 2;
          y = height - marginValue - textHeight;
          break;
        case "bottom-center":
          x = (width - textWidth) / 2;
          y = marginValue;
          break;
        default:
          x = width - textWidth - marginValue;
          y = marginValue;
      }

      drawWatermark(page, x, y);
    }
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  fs.unlinkSync(file.path);

  return res.status(200).json(
    new ApiResponse(200, "PDF watermarked successfully", {
      file: outputName,
    })
  );
});

const addImageWatermark = asyncHandler(async (req, res) => {
  const files = req.files;

  const pdfFile = files?.PDFFILE?.[0];
  const imageFile = files?.WATERMARKIMAGE?.[0];

  if (!pdfFile || !imageFile) {
    throw new ApiError(400, "Both PDF and watermark image are required.");
  }

  let {
    position = "bottom-right",
    transparency = 0.5,
    rotation = 0,
    layer = "overlay",
    fromPage = 1,
    toPage = 1,
    scale = 0.25, 
  } = req.body;

  const fromPageIndex = Math.max(0, Number(fromPage) - 1);
  const toPageIndex = Math.min(Number(toPage) - 1, 1000000);

  const pdfPath = path.resolve(pdfFile.path);
  const imagePath = path.resolve(imageFile.path);

  const name = path.basename(pdfFile.originalname, path.extname(pdfFile.originalname));
  const outputName = `${uuidv4()}___${name}_watermarked.pdf`;
  const outputDir = path.join(process.cwd(), "public", "processed");
  const outputPath = path.join(outputDir, outputName);

  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  if (toPageIndex >= pages.length) {
    throw new ApiError(400, "toPage exceeds number of pages in PDF.");
  }

  const imageBytes = fs.readFileSync(imagePath);
  const isJpg = /\.(jpe?g)$/i.test(imageFile.originalname);
  const image = isJpg ? await pdfDoc.embedJpg(imageBytes) : await pdfDoc.embedPng(imageBytes);

  const { width: imgWidth, height: imgHeight } = image.scale(scale);

  const angle = isNaN(Number(rotation)) ? 0 : Number(rotation);
  const rotate = degrees(angle);
  const margin = 16;

  for (let i = fromPageIndex; i <= toPageIndex; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    let x = 0, y = 0;

    switch (position) {
      case "top-left":
        x = margin;
        y = height - imgHeight - margin;
        break;
      case "top-right":
        x = width - imgWidth - margin;
        y = height - imgHeight - margin;
        break;
      case "bottom-left":
        x = margin;
        y = margin;
        break;
      case "bottom-right":
        x = width - imgWidth - margin;
        y = margin;
        break;
      case "center":
        x = (width - imgWidth) / 2;
        y = (height - imgHeight) / 2;
        break;
      case "top-center":
        x = (width - imgWidth) / 2;
        y = height - imgHeight - margin;
        break;
      case "bottom-center":
        x = (width - imgWidth) / 2;
        y = margin;
        break;
      case "left-center":
        x = margin;
        y = (height - imgHeight) / 2;
        break;
      case "right-center":
        x = width - imgWidth - margin;
        y = (height - imgHeight) / 2;
        break;
      default:
        x = width - imgWidth - margin;
        y = margin;
    }

    page.drawImage(image, {
      x,
      y,
      width: imgWidth,
      height: imgHeight,
      opacity: transparency,
      rotate,
      ...(layer === "overlay" ? { overlay: true } : {}),
    });
  }

  const outputBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, outputBytes);

  fs.unlinkSync(pdfPath);
  fs.unlinkSync(imagePath);

  return res.status(200).json(
    new ApiResponse(200, "PDF image watermark added successfully", {
      file: outputName,
    })
  );
});


export { addTextWatermark, addImageWatermark };
