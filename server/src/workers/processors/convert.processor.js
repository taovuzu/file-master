import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as fss from 'fs';
import path from 'path';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { LIBRE_PATH } from '../../constants.js';
import { v4 as uuidv4 } from "uuid";
import { PDFDocument, PageSizes } from "pdf-lib";
import archiver from "archiver";
import pptxgen from "pptxgenjs";
import pdf from "pdf-poppler";
import { imageSizeFromFile } from 'image-size/fromFile'

export async function convertProcessor(jobId, jobData) {
  const { inputPath, files, outputName, outputDir, outputPath, operation, orientation, pagetype, margin, mergeImagesInOnePdf, originalFileName } = jobData;

  try {
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting file conversion process...'
    });

    let result;

    switch (operation) {
      case 'convertDocToPdf':
        result = await convertDocToPdf(jobId, inputPath, outputDir);
        break;
      case 'convertPdfToPpt':
        result = await convertToPowerPoint(jobId, inputPath, outputPath);
        break;
      case 'convertImagesToPdf': 
        result = await convertImagesToPdf(jobId, files, outputPath, orientation, pagetype, margin, mergeImagesInOnePdf)
        break;
      case 'docx':
      case 'doc':
        result = await convertToWord(jobId, inputPath, outputPath);
        break;
      case 'xlsx':
      case 'xls':
        result = await convertToExcel(jobId, inputPath, outputPath);
        break;
      case 'html':
        result = await convertToHtml(jobId, inputPath, outputPath);
        break;
      case 'txt':
        result = await convertToText(jobId, inputPath, outputPath);
        break;
      default:
        throw new Error(`Unsupported target format: ${operation}`);
    }

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Finalizing conversion and cleaning up...'
    });

    try {
      await fs.unlink(inputPath);
    } catch (unlinkError) {
      console.error(`Error deleting input file ${inputPath}:`, unlinkError);
    }

    // Update Redis with final job data including filename
    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      message: `Successfully converted to ${operation.toUpperCase()}`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: operation
    });

    return {
      outputPath,
      originalFileName,
      operation,
      message: `Successfully converted PDF to ${operation.toUpperCase()}`
    };

  } catch (error) {
    console.error(`Convert failed for job ${jobId}:`, error);
    throw error;
  }
}

async function convertDocToPdf(jobId, inputPath, outputDir) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Converting document to PDF using LibreOffice...'
  });

  const libreCmd = [
    LIBRE_PATH,
    "--headless",
    "--convert-to pdf",
    "--outdir",
    `"${outputDir}"`,
    `"${inputPath}"`
  ].join(" ");

  await new Promise((resolve, reject) => {
    exec(libreCmd, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(new Error(`LibreOffice error: ${error.message}`));
      } else {
        resolve();
      }
    });
  });

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'Document conversion completed...'
  });
}

async function convertImagesToPdf(jobId, files, outputPath, orientation, pagetype, margin, mergeImagesInOnePdf) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Processing images for PDF conversion...'
  });

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
    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Merging images into single PDF...'
    });

    const pdfDoc = await PDFDocument.create();

    for (let file of files) {
      const imgBuffer = await fs.readFile(file.path);
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

      await fs.unlink(file.path);
    }

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);

  } else {
    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Converting images to individual PDFs...'
    });

    const baseOutDir = path.join(process.cwd(), 'temp', `image_to_pdf___${uuidv4()}`);
    await fs.mkdir(baseOutDir, { recursive: true });
    for (let file of files) {
      const imgBuffer = await fs.readFile(file.path);
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

      await fs.writeFile(outPath, pdfBytes);
      await fs.unlink(file.path);
    }

    await updateJobStatus(jobId, 'processing', 60, {
      message: 'Creating ZIP archive of PDFs...'
    });

    const output = fss.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 2 } });

    archive.on("error", (err) => { throw new Error(err); });
    archive.pipe(output);
    archive.directory(baseOutDir, false);
    await archive.finalize();

    await fs.rm(baseOutDir, { recursive: true, force: true }, (err) => {
      if (err) console.error(`Error deleting temp dir: ${err}`);
    });

  }

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'Image conversion completed...'
  });
}

async function convertToWord(jobId, inputPath, outputPath) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Converting to Word document...'
  });

  const libreOfficeCmd = [
    'soffice',
    '--headless',
    '--convert-to', 'docx',
    '--outdir', path.dirname(outputPath),
    inputPath
  ].join(' ');

  await new Promise((resolve, reject) => {
    exec(libreOfficeCmd, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`LibreOffice error: ${error.message}`));
      } else {
        resolve();
      }
    });
  });

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'Word conversion completed...'
  });
}

async function convertToPowerPoint(jobId, inputPath, outputPath) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Converting PDF to PowerPoint...'
  });

  const baseOutDir = path.join(process.cwd(), "temp", `pdf_to_image_${uuidv4()}`);
  await fs.mkdir(baseOutDir, { recursive: true });

  await updateJobStatus(jobId, 'processing', 40, {
    message: 'Extracting images from PDF...'
  });

  const options = {
    format: 'png',
    out_dir: baseOutDir,
    out_prefix: 'slide',
    page: null,
  };

  await pdf.convert(inputPath, options);

  await updateJobStatus(jobId, 'processing', 50, {
    message: 'Creating PowerPoint slides...'
  });

  const imageFiles = (await fs.readdir(baseOutDir)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (imageFiles.length == 0) {
    throw new Error("no image was generated from pdf");
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
  await fs.rm(baseOutDir, { recursive: true, force: true }, (err) => {
    if (err) {
      console.error(`Error deleting directory: ${err}`);
    } else {
      console.log(`Directory and its contents deleted: ${baseOutDir}`);
    }
  });

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'PowerPoint conversion completed...'
  });
}

async function convertToExcel(jobId, inputPath, outputPath) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Converting to Excel spreadsheet...'
  });

  const libreOfficeCmd = [
    'soffice',
    '--headless',
    '--convert-to', 'xlsx',
    '--outdir', path.dirname(outputPath),
    inputPath
  ].join(' ');

  await new Promise((resolve, reject) => {
    exec(libreOfficeCmd, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`LibreOffice error: ${error.message}`));
      } else {
        resolve();
      }
    });
  });

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'Excel conversion completed...'
  });
}

async function convertToHtml(jobId, inputPath, outputPath) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Converting to HTML...'
  });

  // Use pdf-poppler for HTML conversion
  const { pdfToHtml } = await import('pdf-poppler');

  const options = {
    format: 'html',
    out_dir: path.dirname(outputPath),
    out_prefix: path.basename(outputPath, path.extname(outputPath))
  };

  await pdfToHtml(inputPath, options);

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'HTML conversion completed...'
  });
}

async function convertToText(jobId, inputPath, outputPath) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Extracting text from PDF...'
  });

  // Use pdf-poppler for text extraction
  const { pdfToText } = await import('pdf-poppler');

  const options = {
    format: 'txt',
    out_dir: path.dirname(outputPath),
    out_prefix: path.basename(outputPath, path.extname(outputPath))
  };

  await pdfToText(inputPath, options);

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'Text extraction completed...'
  });
}