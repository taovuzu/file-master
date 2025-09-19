import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { QPDF_PATH } from '../../constants.js';
import path from 'path';
import { downloadFromS3ToFile, uploadFileToS3 } from '../../utils/s3.js';

export const compressProcessor = async (jobId, jobData) => {
  const { s3Key, outputPath, outputS3Key, compressionLevel, originalFileName } = jobData;

  const tempDir = path.join('/tmp', jobId);
  const inputPath = path.join(tempDir, 'input.pdf');
  const localOutputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF compression...'
    });

    await updateJobStatus(jobId, 'processing', 25, { message: 'Downloading input from S3...' });
    await downloadFromS3ToFile(s3Key, inputPath);

    const qpdfCmd = [
    QPDF_PATH,
    '--linearize',
    '--object-streams=generate',
    '--compress-streams=y',
    `"${inputPath}"`,
    `"${localOutputPath}"`].
    join(' ');

    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Compressing PDF with QPDF...'
    });

    await new Promise((resolve, reject) => {
      exec(qpdfCmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`QPDF error: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    await updateJobStatus(jobId, 'processing', 80, {
      message: 'Compression completed, cleaning up...'
    });

    await updateJobStatus(jobId, 'processing', 85, { message: 'Uploading result to S3...' });
    if (outputS3Key) {
      await uploadFileToS3(localOutputPath, outputS3Key, 'application/pdf');
    }

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Finalizing compressed PDF...'
    });


    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      outputS3Key: outputS3Key || null,
      message: 'PDF compressed successfully without layout changes',
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: 'compress',
      compressionLevel: compressionLevel,
      compressionMethod: 'QPDF (safe layout)'
    });

    return {
      outputPath,
      outputS3Key: outputS3Key || null,
      originalFileName,
      compressionMethod: 'QPDF (safe layout)',
      message: `PDF compressed successfully without layout changes`
    };

  } catch (error) {
    console.error(`Compression failed for job ${jobId}:`, error);
    throw error;
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error(`Failed to cleanup temp directory for job ${jobId}:`, cleanupError);
    }
  }
};