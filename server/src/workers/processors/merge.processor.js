import { promises as fs } from 'fs';
import path from 'path';
import PDFMerger from "pdf-merger-js";
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { ApiError } from '../../utils/ApiError.js';

export async function mergeProcessor(jobId, jobData) {
  const { inputPaths, outputPath, originalFileNames } = jobData;

  try {
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF merge process...'
    });

    const merger = new PDFMerger();

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
    await fs.writeFile(outputPath, pdfBuffer);

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Cleaning up input files...'
    });

    for (const inputPath of inputPaths) {
      try {
        await fs.unlink(inputPath);
      } catch (unlinkError) {
        console.error(`Error deleting input file ${inputPath}:`, unlinkError);
      }
    }

    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      message: `Successfully merged ${inputPaths.length} PDF files`,
      completedAt: new Date().toISOString(),
      originalFileNames: originalFileNames,
      operation: 'merge',
      filesCount: inputPaths.length
    });

    return {
      outputPath,
      originalFileNames,
      filesCount: inputPaths.length,
      message: `Successfully merged ${inputPaths.length} PDF files`
    };

  } catch (error) {
    console.error(`Merge failed for job ${jobId}:`, error);


    await updateJobStatus(jobId, 'failed', 0, {
      message: error.message || 'Merge processing failed',
      error: error.stack,
      failedAt: new Date().toISOString()
    });

    throw error;
  }
}