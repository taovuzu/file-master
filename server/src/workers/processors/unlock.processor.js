import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { QPDF_PATH } from '../../constants.js';
import { downloadFromS3ToFile, uploadFileToS3 } from '../../utils/s3.js';
import { ApiError } from '../../utils/ApiError.js';

export async function unlockProcessor(jobId, jobData) {
  const { s3Key, outputPath, outputS3Key, password, originalFileName } = jobData;

  const tempDir = path.join('/tmp', jobId);
  const inputPath = path.join(tempDir, 'input.pdf');
  const localOutputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF unlock process...'
    });

    await updateJobStatus(jobId, 'processing', 25, {
      message: 'Downloading file from S3...'
    });

    await downloadFromS3ToFile(s3Key, inputPath);

    const qpdfCmd = [
    QPDF_PATH,
    `--password=${password}`,
    `--decrypt`,
    `"${inputPath}"`,
    `"${localOutputPath}"`].
    join(" ");

    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Removing password protection from PDF...'
    });

    await new Promise((resolve, reject) => {
      exec(qpdfCmd, (error, stdout, stderr) => {
        if (error) {
          reject(ApiError.internal(`QPDF error: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    await updateJobStatus(jobId, 'processing', 80, {
      message: 'Password protection removed, uploading to S3...'
    });

    if (outputS3Key) {
      await uploadFileToS3(localOutputPath, outputS3Key, 'application/pdf');
    }

    await fs.copyFile(localOutputPath, outputPath);

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Finalizing unlocked PDF...'
    });

    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      outputS3Key: outputS3Key || null,
      message: `Successfully unlocked password-protected PDF`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: 'unlock'
    });

    return {
      outputPath,
      outputS3Key: outputS3Key || null,
      originalFileName,
      message: `Successfully unlocked password-protected PDF`
    };

  } catch (error) {
    throw ApiError.internal(`PDF unlock failed: ${error.message}`);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
    }
  }
}