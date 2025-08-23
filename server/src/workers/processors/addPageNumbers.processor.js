import { promises as fs } from 'fs';
import path from 'path';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { updateJobStatus } from '../../queues/pdf.queue.js';

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

export async function addPageNumbersProcessor(jobId, jobData) {
  let { inputPath, outputPath, pageMode,
    firstPageCover,
    position,
    margin,
    firstNumber,
    fromPage,
    toPage,
    textStyle,
    fontFamily,
    fontSize,
    textColor,
    originalFileName
  } = jobData;

  try {

    await updateJobStatus(jobId, 'processing', 20);
    firstPageCover = firstPageCover === true || firstPageCover === "true";
    firstNumber = isNaN(Number(firstNumber)) ? 1 : Number(firstNumber);
    position = position || "bottom-right";
    margin = margin || "normal";

    if (typeof textColor === "string") {
      try {
        textColor = JSON.parse(textColor);
      } catch (e) {
        const parts = textColor.split(",").map((p) => p.trim()).filter(Boolean);
        if (parts.length === 3) {
          textColor = parts.map((p) => Number(p));
        } else {
          textColor = [0, 0, 0];
        }
      }
    }

    const pdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    await updateJobStatus(jobId, 'processing', 40);

    const numberOfPages = pdfDoc.getPages().length;

    const fromPageNum = isNaN(Number(fromPage)) || Number(fromPage) < 1 ? 1 : Number(fromPage);
    const toPageNum =
      isNaN(Number(toPage)) || Number(toPage) < 1 ? numberOfPages : Number(toPage);

    const fromPageIndex = Math.max(0, fromPageNum - 1);
    const toPageIndex = Math.min(toPageNum - 1, numberOfPages - 1);

    if (fromPageIndex > toPageIndex) {
      throw new ApiError(400, "fromPage cannot be greater than toPage");
    }

    const fontSizeValue = fontSizes[fontSize] || fontSizes.normal;
    const marginValue = marginSizes[margin] || marginSizes.normal;

    if (
      !Array.isArray(textColor) ||
      textColor.length !== 3 ||
      textColor.some((c) => typeof c !== "number" || Number.isNaN(c))
    ) {
      textColor = [0, 0, 0];
    } else {
      textColor = textColor.map((c) => {
        const n = Number(c);
        if (n > 1) return Math.max(0, Math.min(1, n / 255));
        return Math.max(0, Math.min(1, n));
      });
    }

    const fontName = fontChoices[fontFamily] || StandardFonts.Helvetica;
    const selectedFont = await pdfDoc.embedFont(fontName);

    const pages = pdfDoc.getPages();
    if (!pages || pages.length === 0) {
      throw new ApiError(400, "PDF has no pages");
    }

    for (let i = fromPageIndex; i <= toPageIndex; i++) {
      if (firstPageCover && i === 0) {
        continue;
      }

      const page = pages[i];
      if (!page) {
        continue;
      }

      const pageNumber = firstNumber + (i - fromPageIndex);
      const writingStyles = [
        `${pageNumber}`,
        `Page ${pageNumber}`,
        `Page ${pageNumber} of ${numberOfPages}`,
      ];

      const styleIndex = isNaN(Number(textStyle)) ? 0 : Number(textStyle);
      const style = writingStyles[styleIndex >= 0 && styleIndex < writingStyles.length ? styleIndex : 0];

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
      const progress = 50 + (i * 30 / numberOfPages);
      await updateJobStatus(jobId, 'processing', Math.round(progress));
    }

    await updateJobStatus(jobId, 'processing', 90);

    const numberedPdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, numberedPdfBytes);

    try {
      await fs.unlink(inputPath);
    } catch (unlinkError) {
      console.error(`Error deleting input file ${inputPath}:`, unlinkError);
    }

    return {
      outputPath,
      originalFileName,
      numberOfPages,
      options: { fontSize, position, fromPageIndex, color: 'black' },
      message: `Successfully added page numbers to ${numberOfPages} pages`
    };

  } catch (error) {
    console.error(`Add page numbers failed for job ${jobId}:`, error);
    throw error;
  }
}


