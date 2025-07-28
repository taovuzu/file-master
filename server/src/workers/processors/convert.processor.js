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
import { imageSizeFromFile } from 'image-size/fromFile';
import { downloadFromS3ToFile, uploadFileToS3 } from '../../utils/s3.js';
import { ApiError } from '../../utils/ApiError.js';

export async function convertProcessor(jobId, jobData) {
  const { s3Key, s3Keys, inputPath, files, outputName, outputDir, outputPath, outputS3Key, operation, orientation, pagetype, margin, mergeImagesInOnePdf, originalFileName } = jobData;
  

  const tempDir = path.join('/tmp', jobId);
  
  let inputExtension = '.pdf';
  let outputExtension = '.pptx';
  
  switch (operation) {
    case 'convertDocToPdf':
      inputExtension = '.docx';
      outputExtension = '.pdf';
      break;
    case 'convertPdfToPpt':
      inputExtension = '.pdf';
      outputExtension = '.pptx';
      break;
    case 'convertPdfToDoc':
      inputExtension = '.pdf';
      outputExtension = '.docx';
      break;
    case 'convertImagesToPdf':
      inputExtension = '.jpg'; 
      const shouldMerge = (mergeImagesInOnePdf === "true" || mergeImagesInOnePdf === true);
      outputExtension = shouldMerge ? '.pdf' : '.zip';
      break;
    default:
      inputExtension = '.pdf';
      outputExtension = '.pdf';
  }
  
  const localInputPath = path.join(tempDir, `input${inputExtension}`);
  const localOutputPath = path.join(tempDir, `output${outputExtension}`);
  

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting file conversion process...'
    });

    await updateJobStatus(jobId, 'processing', 25, {
      message: 'Downloading files from S3...'
    });

    if (s3Key) {
      await downloadFromS3ToFile(s3Key, localInputPath);
    } else if (s3Keys && Array.isArray(s3Keys)) {
      for (let i = 0; i < s3Keys.length; i++) {
        const filePath = path.join(tempDir, `input_${i}`);
        await downloadFromS3ToFile(s3Keys[i], filePath);
      }
    }

    let result;

    switch (operation) {
      case 'convertDocToPdf':
        result = await convertDocToPdf(jobId, localInputPath, outputDir, localOutputPath, outputS3Key);
        break;
      case 'convertPdfToPpt':
        result = await convertToPowerPoint(jobId, localInputPath, localOutputPath, outputS3Key);
        break;
      case 'convertPdfToDoc':
        result = await convertToWord(jobId, localInputPath, localOutputPath, outputS3Key);
        break;
      case 'convertImagesToPdf':
        result = await convertImagesToPdf(jobId, files, localOutputPath, orientation, pagetype, margin, mergeImagesInOnePdf, outputS3Key);
        break;
      case 'docx':
      case 'doc':
        result = await convertToWord(jobId, localInputPath, localOutputPath, outputS3Key);
        break;
      case 'xlsx':
      case 'xls':
        result = await convertToExcel(jobId, localInputPath, localOutputPath, outputS3Key);
        break;
      case 'html':
        result = await convertToHtml(jobId, localInputPath, localOutputPath, outputS3Key);
        break;
      case 'txt':
        result = await convertToText(jobId, localInputPath, localOutputPath, outputS3Key);
        break;
      default:
        throw ApiError.badRequest(`Unsupported target format: ${operation}`);
    }

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Finalizing conversion and cleaning up...'
    });

    if (result && result.outputPath) {
      await fs.copyFile(localOutputPath, outputPath);
    }

    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      outputS3Key: outputS3Key || null,
      message: `Successfully converted to ${operation.toUpperCase()}`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: operation,
      mergeImagesInOnePdf: jobData.mergeImagesInOnePdf
    });

    return {
      outputPath,
      outputS3Key: outputS3Key || null,
      originalFileName,
      operation,
      message: `Successfully converted PDF to ${operation.toUpperCase()}`
    };

  } catch (error) {
    throw ApiError.internal(`PDF conversion failed: ${error.message}`);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
    }
  }
}

async function convertDocToPdf(jobId, inputPath, outputDir, localOutputPath, outputS3Key) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Converting document to PDF using LibreOffice...'
  });

  try {
    await fs.access(inputPath);
  } catch (error) {
    throw ApiError.notFound(`Input file not found: ${inputPath}`);
  }

  const tempOutputDir = path.dirname(localOutputPath);
  const libreCmd = [
    LIBRE_PATH,
    "--headless",
    "--convert-to", "pdf",
    "--outdir", tempOutputDir,
    inputPath
  ].join(" ");


  await new Promise((resolve, reject) => {
    exec(libreCmd, { timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        reject(ApiError.internal(`LibreOffice conversion failed: ${error.message}`));
      } else {
        resolve();
      }
    });
  });

  const inputFileName = path.basename(inputPath, path.extname(inputPath));
  const generatedPdfPath = path.join(tempOutputDir, `${inputFileName}.pdf`);
  
  try {
    await fs.access(generatedPdfPath);
  } catch (error) {
    throw ApiError.notFound(`Generated PDF not found: ${generatedPdfPath}`);
  }

  await fs.rename(generatedPdfPath, localOutputPath);

  const stats = await fs.stat(localOutputPath);
  if (stats.size === 0) {
    throw ApiError.internal('Generated PDF file is empty');
  }

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'Document conversion completed, uploading to S3...'
  });

  if (outputS3Key) {
    await uploadFileToS3(localOutputPath, outputS3Key, 'application/pdf');
  }
}

async function convertImagesToPdf(jobId, files, outputPath, orientation, pagetype, margin, mergeImagesInOnePdf, outputS3Key) {
  
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Processing images for PDF conversion...'
  });

  const marginMap = {
    none: 0,
    small: 20,
    big: 40
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

  const shouldMerge = (mergeImagesInOnePdf === "true" || mergeImagesInOnePdf === true);
  
  if (shouldMerge) {
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
        height: drawHeight
      });

      await fs.unlink(file.path);
    }

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);

    if (outputS3Key) {
      await uploadFileToS3(outputPath, outputS3Key, 'application/pdf');
    }

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
        height: drawHeight
      });

      const name = path.basename(file.originalname, path.extname(file.originalname));
      const outPath = path.join(baseOutDir, `${name}.pdf`);
      const pdfBytes = await pdfDoc.save();

      await fs.writeFile(outPath, pdfBytes);
      await fs.unlink(file.path);
    }

    await updateJobStatus(jobId, 'processing', 60, {
      message: 'Creating ZIP archive of PDFs...'
    });

    const output = fss.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 2 } });

    archive.on("error", (err) => {throw ApiError.internal(`Archive creation failed: ${err.message}`);});
    archive.pipe(output);
    archive.directory(baseOutDir, false);
    await archive.finalize();

    if (outputS3Key) {
      await uploadFileToS3(outputPath, outputS3Key, 'application/zip');
    }

    await fs.rm(baseOutDir, { recursive: true, force: true }, (err) => {
    });

  }

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'Image conversion completed...'
  });
}

async function convertToWord(jobId, inputPath, outputPath, outputS3Key) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Converting to Word document...'
  });

  const libreOfficeCmd = [
  'soffice',
  '--headless',
  '--convert-to', 'docx',
  '--outdir', path.dirname(outputPath),
  inputPath].
  join(' ');

  await new Promise((resolve, reject) => {
    exec(libreOfficeCmd, (error, stdout, stderr) => {
      if (error) {
        reject(ApiError.internal(`LibreOffice error: ${error.message}`));
      } else {
        resolve();
      }
    });
  });

  if (outputS3Key) {
    await uploadFileToS3(outputPath, outputS3Key, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  await updateJobStatus(jobId, 'processing', 70, {
    message: 'Word conversion completed...'
  });
}

async function convertPdfToImages(inputPath, outDir) {
  return new Promise((resolve, reject) => {
    const outPrefix = path.join(outDir, "slide");

    const cmd = `pdftoppm -png "${inputPath}" "${outPrefix}"`;
    exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
      if (error) return reject(ApiError.internal(`pdftoppm failed: ${stderr || error.message}`));
      resolve();
    });
  });
}

async function convertToPowerPoint(jobId, inputPath, outputPath, outputS3Key) {
  await updateJobStatus(jobId, 'processing', 30, {
    message: 'Converting PDF to PowerPoint...'
  });

  const baseOutDir = path.join(process.cwd(), "temp", `pdf_to_image_${uuidv4()}`);
  await fs.mkdir(baseOutDir, { recursive: true });

  await updateJobStatus(jobId, 'processing', 40, {
    message: 'Extracting images from PDF...'
  });

  await convertPdfToImages(inputPath, baseOutDir);

  await updateJobStatus(jobId, 'processing', 50, {
    message: 'Creating PowerPoint slides...'
  });

  const imageFiles = (await fs.readdir(baseOutDir)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (imageFiles.length == 0) {
    throw ApiError.internal("No image was generated from PDF");
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
  
  if (outputS3Key) {
    await uploadFileToS3(outputPath, outputS3Key, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  }
  
  await fs.rm(baseOutDir, { recursive: true, force: true }, (err) => {
    if (err) {
    } else {
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
  inputPath].
  join(' ');

  await new Promise((resolve, reject) => {
    exec(libreOfficeCmd, (error, stdout, stderr) => {
      if (error) {
        reject(ApiError.internal(`LibreOffice error: ${error.message}`));
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