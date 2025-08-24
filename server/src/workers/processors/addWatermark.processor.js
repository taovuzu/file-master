import { promises as fs } from 'fs';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { updateJobStatus } from '../../queues/pdf.queue.js';

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

export async function addWatermarkProcessor(jobId, jobData) {
  let {
    operation,
    inputPath,
    outputPath,
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

  try {
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting watermark addition process...'
    });
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

    textColor = Array.isArray(textColor) && textColor.length === 3
      ? textColor.map(c => Math.min(1, Math.max(0, Number(c))))
      : [0, 0, 0];

    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Processing watermark settings...'
    });

    /** ---------------- TEXT WATERMARK ---------------- **/
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
          color: rgb(...textColor),
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

    /** ---------------- IMAGE WATERMARK ---------------- **/
    // if (operation === 'addImageWatermark') {
    //   const imageBytes = await fs.readFile(imagePath);
    //   const image = imagePath.toLowerCase().endsWith('.png')
    //     ? await pdfDoc.embedPng(imageBytes)
    //     : await pdfDoc.embedJpg(imageBytes);

    //   const imgWidth = image.width * scale;
    //   const imgHeight = image.height * scale;

    //   for (let i = startPage; i <= endPage; i++) {
    //     const page = pdfDoc.getPage(i);
    //     const { width, height } = page.getSize();

    //     if (position === 'mosaic') {
    //       const gapX = imgWidth + 80;
    //       const gapY = imgHeight + 50;

    //       for (let y = 0; y < height; y += gapY) {
    //         for (let x = 0; x < width; x += gapX) {
    //           page.drawImage(image, {
    //             x,
    //             y,
    //             width: imgWidth,
    //             height: imgHeight,
    //             rotate: degrees(rotation),
    //             opacity: transparency
    //           });
    //         }
    //       }
    //     } else {
    //       const { x, y } = getPosition(position, width, height, imgWidth, imgHeight, marginValue);

    //       page.drawImage(image, {
    //         x,
    //         y,
    //         width: imgWidth,
    //         height: imgHeight,
    //         rotate: degrees(rotation),
    //         opacity: transparency
    //       });
    //     }

    //     await reportProgress(jobId, i, startPage, endPage);
    //   }
    // }

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Saving PDF with watermark...'
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    try {
      await fs.unlink(inputPath);
    } catch (unlinkError) {
      console.error(`Error deleting input file ${inputPath}:`, unlinkError);
    }

    // Update Redis with final job data including filename
    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      message: `Successfully processed ${operation} for ${numberOfPages} pages`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: operation,
      numberOfPages: numberOfPages
    });

    return {
      outputPath,
      originalFileName,
      operation,
      numberOfPages,
      message: `Successfully processed ${operation} for ${numberOfPages} pages`
    };
  } catch (error) {
    console.error(`Watermark job failed for ${jobId}:`, error);
    throw error;
  }
}

async function reportProgress(jobId, currentPage, startPage, endPage) {
  const progress = 40 + ((currentPage - startPage + 1) / (endPage - startPage + 1)) * 50;
  await updateJobStatus(jobId, 'processing', Math.round(progress), {
    message: `Processing page ${currentPage + 1}...`
  });
}