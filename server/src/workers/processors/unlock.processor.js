import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { QPDF_PATH } from '../../constants.js';

export async function unlockProcessor(jobId, jobData) {
  const { inputPath, outputPath, password, originalFileName } = jobData;

  try {
    await updateJobStatus(jobId, 'processing', 20);

    const qpdfCmd = [
    QPDF_PATH,
    `--password=${password}`,
    `--decrypt`,
    `"${inputPath}"`,
    `"${outputPath}"`].
    join(" ");

    await updateJobStatus(jobId, 'processing', 40);

    await new Promise((resolve, reject) => {
      exec(qpdfCmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Ghostscript error: ${error.message}`));
        } else {
          resolve();
        }
      });
    });

    await updateJobStatus(jobId, 'processing', 80);

    try {
      await fs.unlink(inputPath);
    } catch (unlinkError) {
      console.error(`Error deleting input file ${inputPath}:`, unlinkError);
    }

    await updateJobStatus(jobId, 'processing', 90);

    return {
      outputPath,
      originalFileName,
      message: `Successfully unlocked password-protected PDF`
    };

  } catch (error) {
    console.error(`Unlock failed for job ${jobId}:`, error);
    throw error;
  }
}