import path from "path";
import fs from "fs";

import { v4 as uuidv4 } from "uuid";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const fontSizes = {
  small: 10,
  normal: 12,
  large: 16,
};

const marginSizes = {
  small: 10,
  normal: 20,
  large: 30,
};

const fontChoices = {
  Arial: StandardFonts.Helvetica,
  "Times New Roman": StandardFonts.TimesRoman,
  Courier: StandardFonts.Courier,
};

const AddPageNumber = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(404, "File could not be found on server");
  }

  let {
    pageMode,
    firstPageCover,
    position,
    margin,
    firstNumber,
    fromPage,
    toPage,
    textStyle,
    fontFamily = "Arial",
    fontSize = "normal",
    textColor = [0, 0, 0],
  } = req.body;

  firstNumber = Number(firstNumber) == NaN ? 1 : Number(firstNumber);
  console.log(firstNumber);
  const fromPageIndex = Math.max(0, Number(fromPage) - 1);
  const toPageIndex = Math.min(Number(toPage) - 1, 1000000);

  const fontSizeValue = fontSizes[fontSize] || fontSizes.normal;
  const marginValue = marginSizes[margin] || marginSizes.normal;

  if (
    !Array.isArray(textColor) ||
    textColor.length !== 3 ||
    textColor.some((c) => typeof c !== "number" || c < 0 || c > 1)
  ) {
    textColor = [0, 0, 0];
  }

  const inputPath = path.resolve(file.path);
  const name = path.basename(file.originalname, path.extname(file.originalname));
  const outputName = `${uuidv4()}___${name}_page_numbered.pdf`;
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

  for (let i = fromPageIndex; i <= toPageIndex; i++) {
    if (firstPageCover && i === 0) continue;

    const page = pdfDoc.getPages()[i];

    const pageNumber = firstNumber + (i - fromPageIndex);
    const writingStyles = [
      `${pageNumber}`,
      `Page ${pageNumber}`,
      `Page ${pageNumber} of ${numberOfPages}`,
    ];

    const style = writingStyles[textStyle] || writingStyles[0];

    const height = page.getHeight();
    const width = page.getWidth();

    const textWidth = selectedFont.widthOfTextAtSize(style, fontSizeValue);

    let x = 0;
    let y = 0;

    switch (position) {
      case "top-left":
        x = marginValue;
        y = height - marginValue - fontSizeValue;
        break;
      case "top-right":
        x = width - textWidth - marginValue;
        y = height - marginValue - fontSizeValue;
        break;
      case "bottom-left":
        x = marginValue;
        y = marginValue;
        break;
      case "bottom-right":
        x = width - textWidth - marginValue;
        y = marginValue;
        break;
      default:
        x = width - textWidth - marginValue;
        y = marginValue;
    }

    if (pageMode === "Facing Pages" && i % 2 === 0) {
      x += 10;
    }

    page.drawText(style, {
      x,
      y,
      size: fontSizeValue,
      font: selectedFont,
      color: rgb(...textColor),
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  fs.unlinkSync(file.path);

  return res.status(200).json(
    new ApiResponse(200, "PDFs page numbered successfully", {
      file: outputName,
    })
  );
});

export { AddPageNumber };
