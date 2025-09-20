import { updateJobStatus } from '../../queues/pdf.queue.js';
import { QPDF_PATH } from '../../constants.js';
import { secureSpawn, validateCommand } from '../../utils/secureSpawn.js';
import { promises as fs } from 'fs';
import path from 'path';

export const compressProcessor = async (jobId, jobData) => {
  const { s3Key, outputPath: sharedOutputPath, outputS3Key, compressionLevel, originalFileName } = jobData;

  // Create temporary directory for processing
  const tempDir = path.join('/tmp', jobId);
  const inputPath = path.join(tempDir, 'input.pdf');
  const localOutputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    await updateJobStatus(jobId, 'processing', 10, {
      message: 'Starting secure PDF compression...'
    });

    // Validate command for security
    validateCommand(QPDF_PATH, ['--linearize', '--object-streams=generate', '--compress-streams=y', inputPath, localOutputPath]);

    await updateJobStatus(jobId, 'processing', 20, {
      message: 'Downloading PDF from S3...'
    });

    // Download from S3 to temporary file
    const { downloadFromS3ToFile } = await import('../../utils/s3.js');
    await downloadFromS3ToFile(s3Key, inputPath);

    await updateJobStatus(jobId, 'processing', 30, {
      message: 'Compressing PDF with QPDF (secure process)...'
    });

    // Use secure spawn with file paths
    const { stdin, stdout, stderr, process: childProcess } = await secureSpawn(
      QPDF_PATH,
      [
        '--linearize',
        '--object-streams=generate',
        '--compress-streams=y',
        inputPath,
        localOutputPath
      ]
    );

    // Wait for process to complete
    await new Promise((resolve, reject) => {
      childProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`QPDF process exited with code ${code}`));
        }
      });
      
      childProcess.on('error', reject);
    });

    await updateJobStatus(jobId, 'processing', 70, {
      message: 'Compression completed, uploading to S3...'
    });

    // Upload compressed file to S3
    if (outputS3Key) {
      const { uploadFileToS3 } = await import('../../utils/s3.js');
      await uploadFileToS3(localOutputPath, outputS3Key, 'application/pdf');
    }

    // Copy to shared path for backward compatibility
    await fs.copyFile(localOutputPath, sharedOutputPath);

    await updateJobStatus(jobId, 'processing', 90, {
      message: 'Compression completed successfully...'
    });

    await updateJobStatus(jobId, 'completed', 100, {
      outputFilePath: sharedOutputPath,
      outputS3Key: outputS3Key || null,
      message: 'PDF compressed successfully using secure process',
      completedAt: new Date().toISOString(),
      originalFileName: originalFileName,
      operation: 'compress',
      compressionLevel: compressionLevel,
      compressionMethod: 'QPDF (secure process)'
    });

    return {
      outputPath: sharedOutputPath,
      outputS3Key: outputS3Key || null,
      originalFileName,
      compressionMethod: 'QPDF (secure process)',
      message: `PDF compressed successfully using secure process`
    };

  } catch (error) {
    
    await updateJobStatus(jobId, 'failed', 0, {
      error: error.message,
      failedAt: new Date().toISOString()
    });
    
    throw error;
  } finally {
    // Clean up temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
    }
  }
};