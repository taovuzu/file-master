import { promises as fs } from 'fs';
import path from 'path';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { PDFDocument, degrees } from 'pdf-lib';

export async function rotateProcessor(jobId, jobData) {
  const { inputPath, outputPath, angle, originalFileName } = jobData;
  
  try {
    await updateJobStatus(jobId, 'processing', 20);

    const pdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    await updateJobStatus(jobId, 'processing', 40);
    
    const numberOfPages = pdfDoc.getPageCount();
    const idxs = Array.from({ length: numberOfPages }, (_, i) => i);
    idxs.forEach(i => pdfDoc.getPages()[i].setRotation(degrees(angle * 90)));
      
    await updateJobStatus(jobId, 'processing', 80);
    
    const rotatedPdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, rotatedPdfBytes);
    
    await updateJobStatus(jobId, 'processing', 90);
    
    try {
      await fs.unlink(inputPath);
    } catch (unlinkError) {
      console.error(`Error deleting input file ${inputPath}:`, unlinkError);
    }
    
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
