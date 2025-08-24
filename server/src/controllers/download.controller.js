import { redisClient } from '../queues/pdf.queue.js';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const checkJobStatus = async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Job ID is required',
      code: 'MISSING_JOB_ID',
      errors: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  try {
    const jobData = await redisClient.hGetAll(`job:${jobId}`);

    if (!jobData || Object.keys(jobData).length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Job not found',
        code: 'JOB_NOT_FOUND',
        errors: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    return res.json({
      success: true,
      statusCode: 200,
      message: 'Job status retrieved successfully',
      data: {
        jobId,
        status: jobData.status,
        progress: jobData.progress || 0,
        message: jobData.message || '',
        outputFilePath: jobData.outputFilePath,
        createdAt: jobData.createdAt,
        updatedAt: jobData.updatedAt
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  } catch (error) {
    console.error('Error checking job status:', error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal server error while checking job status',
      code: 'INTERNAL_ERROR',
      errors: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
};

export const downloadFile = async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Job ID is required',
      code: 'MISSING_JOB_ID',
      errors: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  try {
    const jobData = await redisClient.hGetAll(`job:${jobId}`);

    if (!jobData || Object.keys(jobData).length === 0) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Job not found',
        code: 'JOB_NOT_FOUND',
        errors: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    if (jobData.status !== 'completed') {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Job not completed yet',
        code: 'JOB_NOT_COMPLETED',
        data: {
          status: jobData.status,
          progress: jobData.progress || 0
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const outputPath = jobData.outputFilePath;
    if (!outputPath) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Output file path not found',
        code: 'OUTPUT_FILE_NOT_FOUND',
        errors: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    try {
      await fs.access(outputPath);
    } catch {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Output file not found on disk',
        code: 'FILE_NOT_FOUND_ON_DISK',
        errors: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const ext = path.extname(outputPath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.zip') contentType = 'application/zip';
    else if (ext === '.docx')
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === '.pptx')
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(outputPath)}"`);
    res.setHeader('Content-Type', contentType);

    const fileStream = createReadStream(outputPath);
    fileStream.pipe(res);

    fileStream.on('end', async () => {
      try {
        await fs.unlink(outputPath);
        await redisClient.del(`job:${jobId}`);
        console.log(`Cleaned up job: ${jobId}`);
      } catch (error) {
        console.error('Error cleaning up after download:', error);
      }
    });

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Error streaming file',
        code: 'STREAM_ERROR',
        errors: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    });
  } catch (error) {
    console.error('Error in download:', error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal server error during download',
      code: 'INTERNAL_ERROR',
      errors: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
};
