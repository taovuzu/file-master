import { promises as fs } from 'fs';
import path from 'path';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { PDFDocument, degrees } from 'pdf-lib';

export async function rotateProcessor(jobId, jobData) {
  const { inputPath, outputPath, angle, originalFileName } = jobData;
  
  try {
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF rotation process...'
    });

    const pdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    await updateJobStatus(jobId, 'processing', 40, {
      message: 'Rotating PDF pages...'
    });
    
    const numberOfPages = pdfDoc.getPageCount();
    const idxs = Array.from({ length: numberOfPages }, (_, i) => i);
    idxs.forEach(i => pdfDoc.getPages()[i].setRotation(degrees(angle * 90)));
      
    await updateJobStatus(jobId, 'processing', 80, {
      message: 'Saving rotated PDF...'
    });
    
    const rotatedPdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, rotatedPdfBytes);
    
    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Cleaning up input file...'
    });
    
    try {
      await fs.unlink(inputPath);
    } catch (unlinkError) {
      console.error(`Error deleting input file ${inputPath}:`, unlinkError);
    }

    // Update Redis with final job data including filename
    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      message: `Successfully rotated PDF by ${angle * 90} degrees`,
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: 'rotate',
      angle: angle,
      numberOfPages: numberOfPages
    });
    
    return { 
      outputPath, 
      originalFileName,
      angle,
      numberOfPages,
      message: `Successfully rotated PDF by ${angle * 90} degrees`
    };
    
  } catch (error) {
    console.error(`Rotation failed for job ${jobId}:`, error);
    throw error;
  }
}
