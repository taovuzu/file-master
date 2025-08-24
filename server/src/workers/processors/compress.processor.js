import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { updateJobStatus } from '../../queues/pdf.queue.js';
import { QPDF_PATH } from '../../constants.js';

export const compressProcessor = async (jobId, jobData) => {
  const { inputPath, outputPath, compressionLevel, originalFileName } = jobData;

  try {
    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Starting PDF compression...'
    });

    const qpdfCmd = [
      QPDF_PATH,
      '--linearize',
      '--object-streams=generate',
      '--compress-streams=y',
      `"${inputPath}"`,
      `"${outputPath}"`
    ].join(' ');

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

    try {
      await fs.unlink(inputPath);
    } catch (unlinkError) {
      console.warn(`Could not delete input file ${inputPath}:`, unlinkError);
    }

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Finalizing compressed PDF...'
    });

    // Update Redis with final job data including filename
    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: outputPath,
      message: 'PDF compressed successfully without layout changes',
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: 'compress',
      compressionLevel: compressionLevel,
      compressionMethod: 'QPDF (safe layout)'
    });

    return {
      outputPath,
      originalFileName,
      compressionMethod: 'QPDF (safe layout)',
      message: `PDF compressed successfully without layout changes`
    };

  } catch (error) {
    console.error(`Compression failed for job ${jobId}:`, error);
    throw error;
  }
};













// import { exec } from 'child_process';
// import { promises as fs } from 'fs';
// import path from 'path';
// import { updateJobStatus } from '../../queues/pdf.queue.js';
// import { GS_PATH } from '../../constants.js';

// export const compressProcessor = async (jobId, jobData) => {
//   const { inputPath, outputPath, compressionLevel, originalFileName } = jobData;

//   try {
//     await updateJobStatus(jobId, 'processing', 20);

//     const gsCmd = [
//       GS_PATH,
//       '-q', '-dNOPAUSE', '-dBATCH', '-sDEVICE=pdfwrite',
//       `-dPDFSETTINGS=/${compressionLevel}`,
//       '-dCompressFonts=true',
//       '-dColorImageDownsampleType=/Average', '-dColorImageResolution=72',
//       '-dGrayImageDownsampleType=/Average', '-dGrayImageResolution=72',
//       '-dMonoImageDownsampleType=/Subsample', '-dMonoImageResolution=72',
//       '-dAutoFilterColorImages=false', '-dColorImageFilter=/DCTEncode',
//       '-dAutoFilterGrayImages=false', '-dGrayImageFilter=/DCTEncode',
//       '-dDownsampleMonoImages=true', '-dCompatibilityLevel=1.4',
//       `-sOutputFile="${outputPath}"`,
//       `"${inputPath}"`
//     ].join(" ");

//     await updateJobStatus(jobId, 'processing', 40);

//     await new Promise((resolve, reject) => {
//       exec(gsCmd, (error, stdout, stderr) => {
//         if (error || stderr) {
//           reject(new Error(`Ghostscript error: ${error.message}`));
//         } else {
//           resolve();
//         }
//       });
//     });

//     await updateJobStatus(jobId, 'processing', 80);

//     await fs.access(outputPath);
//     const outputStats = await fs.stat(outputPath);
//     console.log(`Output file created: ${outputPath} (${outputStats.size} bytes)`);

//     try {
//       await fs.unlink(inputPath);
//     } catch (unlinkError) {
//       console.warn(`Could not delete input file ${inputPath}:`, unlinkError);
//     }

//     await updateJobStatus(jobId, 'processing', 90);

//     console.log(`Compression completed successfully for job ${jobId}`);

//     return {
//       outputPath,
//       originalFileName,
//       compressionLevel,
//       message: `PDF compressed successfully with ${compressionLevel} settings`
//     };

//   } catch (error) {
//     console.error(`Compression failed for job ${jobId}:`, error);
//     throw error;
//   }
// };
