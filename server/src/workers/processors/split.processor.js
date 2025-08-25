import { promises as fs } from 'fs';
import * as fss from 'fs';
import path from 'path';
import { v4 as uuidv4 } from "uuid";
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { PDFDocument } from "pdf-lib";
import archiver from "archiver";

export async function splitProcessor(jobId, jobData) {
  const { inputPath, outputPath, outputDir, name, ranges, originalFileName } = jobData;

  try {
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF split process...'
    });

    const baseOutDir = path.join(process.cwd(), "temp", `split___${uuidv4()}`);
    await fs.mkdir(baseOutDir, { recursive: true });

    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Reading PDF and analyzing pages...'
    });

    const uint8Array = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(uint8Array);
    const numberOfPages = pdfDoc.getPages().length;

    let outputPaths = [];

    await updateJobStatus(jobId, 'processing', 50, {
      message: `Splitting PDF into ${ranges.length} sections...`
    });

    for (let i = 0; i < ranges.length; i++) {
      console.log(typeof ranges[i]);
      console.log(ranges[i]);
      let [start, end] = ranges[i].map(Number);
      if (start < 1 || end < start) {
        continue;
      }

      const actualEnd = Math.min(end, numberOfPages);
      const idxs = Array.from({ length: actualEnd - start + 1 }, (_, i) => start - 1 + i);
      const subDocument = await PDFDocument.create();
      const pages = await subDocument.copyPages(pdfDoc, idxs);
      pages.forEach((p) => subDocument.addPage(p));

      const subDocumentOutName = `${name}-splited-${start}-${actualEnd}.pdf`;
      const subDocumentOutPath = path.join(baseOutDir, subDocumentOutName);
      const pdfBytes = await subDocument.save();
      await fs.writeFile(subDocumentOutPath, pdfBytes);

      outputPaths.push(subDocumentOutPath);
    }

    await updateJobStatus(jobId, 'processing', 70, {
      message: 'Cleaning up input file...'
    });

    await fs.unlink(inputPath);

    await updateJobStatus(jobId, 'processing', 80, {
      message: 'Creating ZIP archive of split PDFs...'
    });

    const output = fss.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 2 }
    });

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Finalizing ZIP archive...'
    });

    archive.on("error", (err) => {throw new Error(err);});

    archive.pipe(output);
    archive.directory(baseOutDir, false);
    await archive.finalize();

    await fs.rm(baseOutDir, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error(`Error deleting directory: ${err}`);
      } else {
        console.log(`Directory and its contents deleted: ${baseOutDir}`);
      }
    });


    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
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
      numberOfPages,
      message: `Successfully split PDF into ${outputPaths.length} files`
    };

  } catch (error) {
    console.error(`Split failed for job ${jobId}:`, error);
    throw error;
  }
}