import { redisClient } from '../queues/pdf.queue.js';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SHARED_PROCESSED_PATH } from '../constants.js';
import { createPresignedGetUrl } from '../utils/s3.js';

export const checkJobStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw ApiError.badRequest('Job ID is required');
  }

  try {
    const jobData = await redisClient.hGetAll(`job:${jobId}`);

    if (!jobData || Object.keys(jobData).length === 0) {
      throw ApiError.notFound('Job not found');
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
    throw ApiError.internal('Internal server error while checking job status');
  }
});

export const downloadFile = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw ApiError.badRequest('Job ID is required');
  }

  try {
    const jobData = await redisClient.hGetAll(`job:${jobId}`);

    if (!jobData || Object.keys(jobData).length === 0) {
      throw ApiError.notFound('Job not found');
    }


    if (jobData.status !== 'completed') {
      throw ApiError.badRequest(`Job is not completed. Current status: ${jobData.status}`);
    }

    if (jobData.outputS3Key) {
      // authorize user if needed (omitted for brevity)
      const url = await createPresignedGetUrl(jobData.outputS3Key, 60);
      
      // Determine the correct file name based on operation type
      let fileName = jobData.originalFileName || 'processed-document.pdf';
      if (jobData.operation === 'split') {
        const baseName = jobData.originalFileName?.replace(/\.pdf$/i, '') || 'document';
        // Check if it's a single split (PDF) or multiple splits (ZIP)
        // We'll determine this based on the S3 key or job data
        const isSingleSplit = jobData.ranges && Array.isArray(jobData.ranges) && jobData.ranges.length === 1;
        if (isSingleSplit) {
          fileName = `${baseName}-split.pdf`;
        } else {
          fileName = `${baseName}-split.zip`;
        }
      } else if (jobData.operation === 'merge') {
        const baseName = jobData.originalFileName?.replace(/\.pdf$/i, '') || 'document';
        fileName = `${baseName}-merged.pdf`;
      }
      
      return res.json({
        success: true,
        downloadUrl: url,
        fileName: fileName,
        expiresIn: 60
      });
    }

    if (jobData.outputFilePath) {
      const filePath = jobData.outputFilePath;
      try {
        await fs.access(filePath);
      } catch (error) {
        throw ApiError.notFound('Output file not found on server');
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
    }

    throw ApiError.notFound('No output available for this job');
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
});

export const downloadFileByPath = asyncHandler(async (req, res) => {
  const { file } = req.params;

  if (!file) {
    throw ApiError.badRequest('File parameter is required');
  }

  const filePath = path.join(SHARED_PROCESSED_PATH, file);

  try {
    await fs.access(filePath);
  } catch (error) {
    throw ApiError.notFound('File not found');
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
    const processedDir = SHARED_PROCESSED_PATH;

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
    throw ApiError.internal('Internal server error while listing processed files');
  }
});

export const deleteProcessedFile = asyncHandler(async (req, res) => {
  const { file } = req.params;

  if (!file) {
    throw ApiError.badRequest('File parameter is required');
  }

  try {
    const filePath = path.join(SHARED_PROCESSED_PATH, file);

    try {
      await fs.access(filePath);
    } catch (error) {
      throw ApiError.notFound('File not found');
    }

    await fs.unlink(filePath);

    return ApiResponse
      .success({ deletedFile: file }, 'File deleted successfully', 200)
      .withRequest(req)
      .send(res);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw ApiError.internal('Internal server error while deleting file');
  }
});