import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { QPDF_PATH } from '../../constants.js';

export async function protectProcessor(jobId, jobData) {
  const { inputPath, outputPath, password, originalFileName } = jobData;

  try {
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF protection process...'
    });
    const qpdfCmd = [
    QPDF_PATH,
    `--encrypt "${password}" "${password}" 256`,
    `--`,
    `"${inputPath}"`,
    `"${outputPath}"`].
    join(' ');

    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Adding password protection to PDF...'
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
      message: 'Password protection added successfully, cleaning up...'
    });

    try {
      await fs.unlink(inputPath);
    } catch (unlinkError) {
      console.error(`Error deleting input file ${inputPath}:`, unlinkError);
    }

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Finalizing protected PDF...'
    });


    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      message: `Successfully added password protection to PDF`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: 'protect'
    });

    return {
      outputPath,
      originalFileName,
      message: `Successfully added password protection to PDF`
    };

  } catch (error) {
    console.error(`Protect failed for job ${jobId}:`, error);
    throw error;
  }
}