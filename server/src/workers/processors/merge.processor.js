import { promises as fs } from 'fs';
import path from 'path';
import PDFMerger from "pdf-merger-js";
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { ApiError } from '../../utils/ApiError.js';
import { downloadFromS3ToFile, uploadFileToS3 } from '../../utils/s3.js';

export async function mergeProcessor(jobId, jobData) {
  const { s3Keys, outputPath, outputS3Key, originalFileNames } = jobData;

  const tempDir = path.join('/tmp', jobId);
  const localOutputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF merge process...'
    });

    const merger = new PDFMerger();

    await updateJobStatus(jobId, 'processing', 25, {
      message: 'Downloading files from S3...'
    });

    const inputPaths = [];
    for (let i = 0; i < s3Keys.length; i++) {
      const inputPath = path.join(tempDir, `input_${i}.pdf`);
      await downloadFromS3ToFile(s3Keys[i], inputPath);
      inputPaths.push(inputPath);
    }

    await updateJobStatus(jobId, 'processing', 30, {
      message: 'Adding PDF files to merger...'
    });

    for (let i = 0; i < inputPaths.length; i++) {
      await merger.add(inputPaths[i]);
      const progress = 30 + i * 40 / inputPaths.length;
      await updateJobStatus(jobId, 'processing', Math.round(progress), {
        message: `Processing file ${i + 1} of ${inputPaths.length}...`
      });
    }

    await updateJobStatus(jobId, 'processing', 70, {
      message: 'Setting PDF metadata...'
    });

    await merger.setMetadata({
      producer: "file_master",
      author: "file_master",
      creator: "file_master",
      title: "file_master_merged"
    });

    await updateJobStatus(jobId, 'processing', 80, {
      message: 'Generating merged PDF...'
    });

    const pdfBuffer = await merger.saveAsBuffer();
    await fs.writeFile(localOutputPath, pdfBuffer);

    await updateJobStatus(jobId, 'processing', 85, {
      message: 'Uploading result to S3...'
    });

    if (outputS3Key) {
      await uploadFileToS3(localOutputPath, outputS3Key, 'application/pdf');
    }

    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      outputS3Key: outputS3Key || null,
      message: `Successfully merged ${inputPaths.length} PDF files`,
      completedAt: new Date().toISOString(),
      originalFileNames: originalFileNames,
      operation: 'merge',
      filesCount: inputPaths.length
    });

    return {
      outputPath,
      outputS3Key: outputS3Key || null,
      originalFileNames,
      filesCount: inputPaths.length,
      message: `Successfully merged ${inputPaths.length} PDF files`
    };

  } catch (error) {
    await updateJobStatus(jobId, 'failed', 0, {
      message: error.message || 'Merge processing failed',
      error: error.stack,
      failedAt: new Date().toISOString()
    });

    throw ApiError.internal(`PDF merge failed: ${error.message}`);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
    }
  }
}