import { promises as fs } from 'fs';
import path from 'path';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { downloadFromS3ToFile, uploadFileToS3 } from '../../utils/s3.js';
import { ApiError } from '../../utils/ApiError.js';

const fontSizes = {
  small: 10,
  normal: 12,
  large: 16
};

const marginSizes = {
  small: 10,
  normal: 20,
  large: 30
};

const fontChoices = {
  Arial: StandardFonts.Helvetica,
  "Times New Roman": StandardFonts.TimesRoman,
  Courier: StandardFonts.Courier
};

export async function addPageNumbersProcessor(jobId, jobData) {
  let { s3Key, outputPath, outputS3Key, pageMode,
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

  const tempDir = path.join('/tmp', jobId);
  const inputPath = path.join(tempDir, 'input.pdf');
  const localOutputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting page numbers addition process...'
    });

    await updateJobStatus(jobId, 'processing', 25, {
      message: 'Downloading file from S3...'
    });

    await downloadFromS3ToFile(s3Key, inputPath);
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

    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Analyzing PDF structure...'
    });

    const numberOfPages = pdfDoc.getPages().length;

    const fromPageNum = isNaN(Number(fromPage)) || Number(fromPage) < 1 ? 1 : Number(fromPage);
    const toPageNum =
    isNaN(Number(toPage)) || Number(toPage) < 1 ? numberOfPages : Number(toPage);

    const fromPageIndex = Math.max(0, fromPageNum - 1);
    const toPageIndex = Math.min(toPageNum - 1, numberOfPages - 1);

    if (fromPageIndex > toPageIndex) {
      throw ApiError.badRequest("fromPage cannot be greater than toPage");
    }

    const fontSizeValue = fontSizes[fontSize] || fontSizes.normal;
    const marginValue = marginSizes[margin] || marginSizes.normal;

    if (
    !Array.isArray(textColor) ||
    textColor.length !== 3 ||
    textColor.some((c) => typeof c !== "number" || Number.isNaN(c)))
    {
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
      throw ApiError.badRequest("PDF has no pages");
    }

    await updateJobStatus(jobId, 'processing', 50, {
      message: 'Adding page numbers to PDF pages...'
    });

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
      `Page ${pageNumber} of ${numberOfPages}`];


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
        color: rgb(...textColor)
      });
      const progress = 50 + i * 30 / numberOfPages;
      await updateJobStatus(jobId, 'processing', Math.round(progress), {
        message: `Processing page ${i + 1} of ${numberOfPages}...`
      });
    }

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Saving PDF with page numbers...'
    });

    const numberedPdfBytes = await pdfDoc.save();
    await fs.writeFile(localOutputPath, numberedPdfBytes);

    await updateJobStatus(jobId, 'processing', 95, {
      message: 'Uploading result to S3...'
    });

    if (outputS3Key) {
      await uploadFileToS3(localOutputPath, outputS3Key, 'application/pdf');
    }

    await fs.copyFile(localOutputPath, outputPath);

    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      outputS3Key: outputS3Key || null,
      message: `Successfully added page numbers to ${numberOfPages} pages`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: 'addPageNumbers',
      numberOfPages: numberOfPages,
      options: { fontSize, position, fromPageIndex, color: 'black' }
    });

    return {
      outputPath,
      outputS3Key: outputS3Key || null,
      originalFileName,
      numberOfPages,
      options: { fontSize, position, fromPageIndex, color: 'black' },
      message: `Successfully added page numbers to ${numberOfPages} pages`
    };

  } catch (error) {
    throw ApiError.internal(`Page numbering failed: ${error.message}`);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
    }
  }
}