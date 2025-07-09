import { promises as fs } from 'fs';
import * as fss from 'fs';
import path from 'path';
import { v4 as uuidv4 } from "uuid";
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { PDFDocument } from "pdf-lib";
import archiver from "archiver";
import { downloadFromS3ToFile, uploadFileToS3 } from '../../utils/s3.js';
import { ApiError } from '../../utils/ApiError.js';

export async function splitProcessor(jobId, jobData) {
  const { s3Key, outputPath, outputS3Key, outputDir, name, ranges, originalFileName, isSingleRange, fileExtension } = jobData;

  const tempDir = path.join('/tmp', jobId);
  const inputPath = path.join(tempDir, 'input.pdf');
  let localOutputPath = path.join(tempDir, `output.${fileExtension || 'zip'}`);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF split process...'
    });

    await updateJobStatus(jobId, 'processing', 25, {
      message: 'Downloading file from S3...'
    });

    await downloadFromS3ToFile(s3Key, inputPath);

    const baseOutDir = path.join(tempDir, `split___${uuidv4()}`);
    await fs.mkdir(baseOutDir, { recursive: true });

    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Reading PDF and analyzing pages...'
    });

    const uint8Array = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(uint8Array);
    const numberOfPages = pdfDoc.getPages().length;

    let outputPaths = [];

    if (!ranges || !Array.isArray(ranges) || ranges.length === 0) {
      throw ApiError.badRequest('No valid page ranges provided for splitting');
    }

    await updateJobStatus(jobId, 'processing', 50, {
      message: `Splitting PDF into ${ranges.length} sections...`
    });

    for (let i = 0; i < ranges.length; i++) {      
      let start, end;
      if (Array.isArray(ranges[i])) {
        [start, end] = ranges[i].map(Number);
      } else if (typeof ranges[i] === 'string') {
        const parts = ranges[i].split('-');
        start = parseInt(parts[0]);
        end = parseInt(parts[1]);
      } else {
        continue;
      }
      
      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        continue;
      }

      const actualEnd = Math.min(end, numberOfPages);
      const idxs = Array.from({ length: actualEnd - start + 1 }, (_, idx) => start - 1 + idx);
            
      const subDocument = await PDFDocument.create();
      const pages = await subDocument.copyPages(pdfDoc, idxs);
      pages.forEach((p) => subDocument.addPage(p));

      const subDocumentOutName = `${name}-split-${start}-${actualEnd}.pdf`;
      const subDocumentOutPath = path.join(baseOutDir, subDocumentOutName);
      const pdfBytes = await subDocument.save();
      await fs.writeFile(subDocumentOutPath, pdfBytes);
      outputPaths.push(subDocumentOutPath);
    }

    if (outputPaths.length === 0) {
      throw ApiError.badRequest('No valid page ranges could be processed for splitting');
    }

    if (isSingleRange || outputPaths.length === 1) {
      const pdfOutputPath = localOutputPath.replace(/\.(zip|pdf)$/, '.pdf');
      await fs.copyFile(outputPaths[0], pdfOutputPath);
      
      localOutputPath = pdfOutputPath;
      
      await updateJobStatus(jobId, 'processing', 80, {
        message: 'Single split PDF created successfully'
      });
    } else {
      await updateJobStatus(jobId, 'processing', 70, {
        message: `Creating ZIP archive with ${outputPaths.length} split PDFs...`
      });

      await new Promise((resolve, reject) => {
        const output = fss.createWriteStream(localOutputPath);
        const archive = archiver("zip", {
          zlib: { level: 2 }
        });

        output.on('close', () => {
          resolve();
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);
        
        for (const filePath of outputPaths) {
          const fileName = path.basename(filePath);
          archive.file(filePath, { name: fileName });
        }
        
        archive.finalize();
      });
    }

    const fileStats = await fs.stat(localOutputPath);
    const actualFileExtension = path.extname(localOutputPath).toLowerCase();
    const fileType = actualFileExtension === '.zip' ? 'ZIP' : 'PDF';
    
    if (fileStats.size === 0) {
      throw ApiError.internal(`${fileType} file is empty - creation failed`);
    }

    await updateJobStatus(jobId, 'processing', 80, {
      message: `${fileType} file created successfully (${Math.round(fileStats.size / 1024)} KB)`
    });

    await updateJobStatus(jobId, 'processing', 85, {
      message: 'Uploading result to S3...'
    });

    if (outputS3Key) {
      const contentType = actualFileExtension === '.zip' ? 'application/zip' : 'application/pdf';
      await uploadFileToS3(localOutputPath, outputS3Key, contentType);
    }


    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      outputS3Key: outputS3Key || null,
      message: `Successfully split PDF into ${outputPaths.length} files`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: 'split',
      numberOfPages: numberOfPages,
      ranges: ranges
    });

    return {
      outputDir,
      outputPath,
      outputS3Key: outputS3Key || null,
      numberOfPages,
      message: `Successfully split PDF into ${outputPaths.length} files`
    };

  } catch (error) {
    throw ApiError.internal(`PDF split failed: ${error.message}`);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
    }
  }
}