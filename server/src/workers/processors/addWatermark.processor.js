import { promises as fs } from 'fs';
import path from 'path';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { downloadFromS3ToFile, uploadFileToS3 } from '../../utils/s3.js';
import { ApiError } from '../../utils/ApiError.js';

const fontSizes = {
  small: 20,
  normal: 28,
  large: 36
};

const fontChoices = {
  Arial: StandardFonts.Helvetica,
  "Times New Roman": StandardFonts.TimesRoman,
  Courier: StandardFonts.Courier
};

export async function addWatermarkProcessor(jobId, jobData) {
  let {
    operation,
    s3Key,
    pdfS3Key,
    imageS3Key,
    outputPath,
    outputS3Key,
    text,
    position,
    transparency,
    rotation,
    layer,
    fromPage,
    toPage,
    fontFamily,
    fontSize,
    textColor,
    originalFileName
  } = jobData;

  const tempDir = path.join('/tmp', jobId);
  const inputPath = path.join(tempDir, 'input.pdf');
  const imagePath = path.join(tempDir, 'image.png');
  const localOutputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting watermark addition process...'
    });

    await updateJobStatus(jobId, 'processing', 25, {
      message: 'Downloading files from S3...'
    });

    const pdfS3KeyToUse = s3Key || pdfS3Key;
    await downloadFromS3ToFile(pdfS3KeyToUse, inputPath);

    if (operation === 'addImageWatermark' && imageS3Key) {
      await downloadFromS3ToFile(imageS3Key, imagePath);
    }

    const uint8Array = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(uint8Array);
    const numberOfPages = pdfDoc.getPages().length;

    transparency = parseFloat(transparency);
    rotation = parseFloat(rotation);
    fromPage = parseInt(fromPage);
    toPage = parseInt(toPage);

    if (isNaN(transparency) || transparency < 0 || transparency > 1) {
      transparency = 0.5;
    }

    if (isNaN(rotation)) rotation = 0;


    const fromPageIndex = Math.max(0, Number(fromPage));
    const toPageIndex = Math.min(Number(toPage), numberOfPages - 1);

    const fontSizeValue = fontSizes[fontSize] || fontSizes.normal;
    const marginValue = 16;

    textColor = Array.isArray(textColor) && textColor.length === 3 ?
    textColor.map((c) => Math.min(1, Math.max(0, Number(c)))) :
    [0, 0, 0];

    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Processing watermark settings...'
    });


    if (operation === 'addTextWatermark') {
      await updateJobStatus(jobId, 'processing', 45, {
        message: 'Adding text watermark to PDF pages...'
      });

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
          color: rgb(...textColor)
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
        await reportProgress(jobId, i, fromPageIndex, toPageIndex);
      }
    }
















































    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Saving PDF with watermark...'
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(localOutputPath, pdfBytes);

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
      message: `Successfully processed ${operation} for ${numberOfPages} pages`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: operation,
      numberOfPages: numberOfPages
    });

    return {
      outputPath,
      outputS3Key: outputS3Key || null,
      originalFileName,
      operation,
      numberOfPages,
      message: `Successfully processed ${operation} for ${numberOfPages} pages`
    };
  } catch (error) {
    throw ApiError.internal(`Watermark processing failed: ${error.message}`);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
    }
  }
}

async function reportProgress(jobId, currentPage, startPage, endPage) {
  const progress = 40 + (currentPage - startPage + 1) / (endPage - startPage + 1) * 50;
  await updateJobStatus(jobId, 'processing', Math.round(progress), {
    message: `Processing page ${currentPage + 1}...`
  });
}