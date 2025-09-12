import { redisClient } from '../queues/pdf.queue.js';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const checkJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw new ApiError.badRequest('Job ID is required');
  }

  try {
    const jobData = await redisClient.hGetAll(`job:${jobId}`);

    if (!jobData || Object.keys(jobData).length === 0) {
      throw new ApiError.notFound('Job not found');
    }


    const isJobSuccessful = jobData.status === 'completed';
    const responseSuccess = isJobSuccessful || jobData.status === 'processing' || jobData.status === 'queued';


    let statusMessage = 'Job status retrieved successfully';
    if (jobData.status === 'failed') {
      statusMessage = jobData.message || 'Job processing failed';
    } else if (jobData.status === 'cancelled') {
      statusMessage = 'Job was cancelled';
    } else if (jobData.status === 'processing') {
      statusMessage = 'Job is being processed';
    } else if (jobData.status === 'queued') {
      statusMessage = 'Job is queued for processing';
    }


    const responseData = {
      jobId,
      status: jobData.status,
      progress: jobData.progress || 0,
      message: jobData.message || '',
      outputFilePath: jobData.outputFilePath,
      createdAt: jobData.createdAt,
      updatedAt: jobData.updatedAt
    };


    if (jobData.status === 'failed') {
      responseData.error = jobData.message || 'Job processing failed';
      responseData.failed = true;
    }

    const statusCode = responseSuccess ? 200 : 400;
    const resp = responseSuccess
      ? ApiResponse.success(responseData, statusMessage, statusCode)
      : new ApiResponse(statusCode, responseData, statusMessage, false);
    return resp.withRequest(req).send(res);
  } catch (error) {
    console.error('Error checking job status:', error);
    throw new ApiError.internal('Internal server error while checking job status');
  }
});

export const downloadFile = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw new ApiError.badRequest('Job ID is required');
  }

  try {
    const jobData = await redisClient.hGetAll(`job:${jobId}`);

    if (!jobData || Object.keys(jobData).length === 0) {
      throw new ApiError.notFound('Job not found');
    }

    if (jobData.status !== 'completed') {
      throw new ApiError.badRequest(`Job is not completed. Current status: ${jobData.status}`);
    }

    if (!jobData.outputFilePath) {
      throw new ApiError.notFound('Output file path not found for completed job');
    }

    const filePath = jobData.outputFilePath;

    try {
      await fs.access(filePath);
    } catch (error) {
      throw new ApiError.notFound('Output file not found on server');
    }

    const fileName = path.basename(filePath);
    const match = fileName.match(/^.+___(.+)$/);
    const downloadFileName = match ? match[1] : fileName;

    return res.download(filePath, downloadFileName, (err) => {
      if (err) {
        console.error('File download failed:', err);
      } else {
        console.log('File downloaded successfully.');
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
});

export const downloadFileByPath = asyncHandler(async (req, res) => {
  const { file } = req.params;

  if (!file) {
    throw new ApiError.badRequest('File parameter is required');
  }

  const filePath = path.join(process.cwd(), 'public', 'processed', file);

  try {
    await fs.access(filePath);
  } catch (error) {
    throw new ApiError.notFound('File not found');
  }

  const match = file.match(/^.+___(.+)$/);
  const downloadFileName = match ? match[1] : file;

  return res.download(filePath, downloadFileName, (err) => {
    if (err) {
      console.error('File download failed:', err);
    } else {
      console.log('File downloaded successfully.');
    }
  });
});

export const listProcessedFiles = asyncHandler(async (req, res) => {
  try {
    const processedDir = path.join(process.cwd(), 'public', 'processed');

    try {
      await fs.access(processedDir);
    } catch (error) {
      return ApiResponse
        .success([], 'No processed files found', 200)
        .withRequest(req)
        .send(res);
    }

    const files = await fs.readdir(processedDir);
    const fileList = [];

    for (const file of files) {
      try {
        const filePath = path.join(processedDir, file);
        const stats = await fs.stat(filePath);

        if (stats.isFile()) {
          const match = file.match(/^.+___(.+)$/);
          const originalName = match ? match[1] : file;

          fileList.push({
            fileName: file,
            originalName: originalName,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          });
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }

    return ApiResponse
      .success(fileList, 'Processed files retrieved successfully', 200)
      .withRequest(req)
      .send(res);
  } catch (error) {
    console.error('Error listing processed files:', error);
    throw new ApiError.internal('Internal server error while listing processed files');
  }
});

export const deleteProcessedFile = asyncHandler(async (req, res) => {
  const { file } = req.params;

  if (!file) {
    throw new ApiError.badRequest('File parameter is required');
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'processed', file);

    try {
      await fs.access(filePath);
    } catch (error) {
      throw new ApiError.notFound('File not found');
    }

    await fs.unlink(filePath);

    return ApiResponse
      .success({ deletedFile: file }, 'File deleted successfully', 200)
      .withRequest(req)
      .send(res);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new ApiError.internal('Internal server error while deleting file');
  }
});