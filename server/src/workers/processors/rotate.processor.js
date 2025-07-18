import { promises as fs } from 'fs';
import path from 'path';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { PDFDocument, degrees } from 'pdf-lib';
import { downloadFromS3ToFile, uploadFileToS3 } from '../../utils/s3.js';
import { ApiError } from '../../utils/ApiError.js';

export async function rotateProcessor(jobId, jobData) {
  const { s3Key, outputPath, outputS3Key, angle, originalFileName } = jobData;

  const tempDir = path.join('/tmp', jobId);
  const inputPath = path.join(tempDir, 'input.pdf');
  const localOutputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF rotation process...'
    });

    await updateJobStatus(jobId, 'processing', 25, {
      message: 'Downloading file from S3...'
    });

    await downloadFromS3ToFile(s3Key, inputPath);

    const pdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Rotating PDF pages...'
    });

    const numberOfPages = pdfDoc.getPageCount();
    const idxs = Array.from({ length: numberOfPages }, (_, i) => i);
    idxs.forEach((i) => pdfDoc.getPages()[i].setRotation(degrees(angle * 90)));

    await updateJobStatus(jobId, 'processing', 80, {
      message: 'Saving rotated PDF...'
    });

    const rotatedPdfBytes = await pdfDoc.save();
    await fs.writeFile(localOutputPath, rotatedPdfBytes);

    await updateJobStatus(jobId, 'processing', 85, {
      message: 'Uploading result to S3...'
    });

    if (outputS3Key) {
      await uploadFileToS3(localOutputPath, outputS3Key, 'application/pdf');
    }

    await fs.copyFile(localOutputPath, outputPath);

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Cleaning up temporary files...'
    });


    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      outputS3Key: outputS3Key || null,
      message: `Successfully rotated PDF by ${angle * 90} degrees`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: 'rotate',
      angle: angle,
      numberOfPages: numberOfPages
    });

    return {
      outputPath,
      outputS3Key: outputS3Key || null,
      originalFileName,
      angle,
      numberOfPages,
      message: `Successfully rotated PDF by ${angle * 90} degrees`
    };

  } catch (error) {
    throw ApiError.internal(`PDF rotation failed: ${error.message}`);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
    }
  }
}