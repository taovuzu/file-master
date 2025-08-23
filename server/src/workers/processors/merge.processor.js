import { promises as fs } from 'fs';
import path from 'path';
import PDFMerger from "pdf-merger-js";
import { updateJobStatus } from '../../queues/pdf.queue.js';

export async function mergeProcessor(jobId, jobData) {
  const { inputPaths, outputPath, originalFileNames } = jobData;

  try {
    await updateJobStatus(jobId, 'processing', 20);

    const merger = new PDFMerger();

    await updateJobStatus(jobId, 'processing', 30);

    for (let i = 0; i < inputPaths.length; i++) {
      await merger.add(inputPaths[i]);
      const progress = 30 + (i * 40 / inputPaths.length);
      await updateJobStatus(jobId, 'processing', Math.round(progress));
    }

    await updateJobStatus(jobId, 'processing', 70);

    await merger.setMetadata({
      producer: "file_master",
      author: "file_master",
      creator: "file_master",
      title: "file_master_merged",
    });

    await updateJobStatus(jobId, 'processing', 80);

    const pdfBuffer = await merger.saveAsBuffer();
    await fs.writeFile(outputPath, pdfBuffer);

    await updateJobStatus(jobId, 'processing', 90);

    for (const inputPath of inputPaths) {
      try {
        await fs.unlink(inputPath);
      } catch (unlinkError) {
        console.error(`Error deleting input file ${inputPath}:`, unlinkError);
      }
    }

    return {
      outputPath,
      originalFileNames,
      filesCount: inputPaths.length,
      message: `Successfully merged ${inputPaths.length} PDF files`
    };

  } catch (error) {
    console.error(`Merge failed for job ${jobId}:`, error);
    throw error;
  }
}
