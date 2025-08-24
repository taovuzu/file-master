import { redisClient } from '../queues/pdf.queue.js';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';

export const checkJobStatus = async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  const jobData = await redisClient.hGetAll(`job:${jobId}`);

  if (!jobData || Object.keys(jobData).length === 0) {
    return res.status(404).json({ error: 'Job not found' });
  }

  return res.json({
    jobId,
    status: jobData.status,
    progress: jobData.progress || 0,
    message: jobData.message || ''
  });
};

export const downloadFile = async (req, res) => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }

  const jobData = await redisClient.hGetAll(`job:${jobId}`);

  if (!jobData || Object.keys(jobData).length === 0) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (jobData.status !== 'completed') {
    return res.status(400).json({
      error: 'Job not completed yet',
      status: jobData.status,
      progress: jobData.progress || 0
    });
  }

  const outputPath = jobData.outputFilePath;
  if (!outputPath) {
    return res.status(404).json({ error: 'Output file path not found' });
  }

  try {
    await fs.access(outputPath);
  } catch {
    return res.status(404).json({ error: 'Output file not found' });
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
};
