import express from 'express';
import multer from 'multer';
import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadQueue, getJobStatus, deleteJobData, redisClient } from '../queues/bullQueue.js';
import { cleanupJobDirectory } from '../utils/cleanup.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure temp uploads directory exists
const tempUploadsDir = join(__dirname, '..', '..', 'temp', 'uploads');
const jobsDir = join(__dirname, '..', '..', 'jobs');

async function ensureDirectories() {
  try {
    await fs.mkdir(tempUploadsDir, { recursive: true });
    await fs.mkdir(jobsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

ensureDirectories();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF files and common document formats
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Office documents, and images are allowed.'), false);
    }
  }
});

// POST /upload - File upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobId = uuidv4();
    const tempFilePath = req.file.path;
    const jobDir = join(jobsDir, jobId);
    const inputDir = join(jobDir, 'input');
    const outputDir = join(jobDir, 'output');

    // Create job directories
    await fs.mkdir(inputDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });

    // Move file from temp to job input directory
    const inputFilePath = join(inputDir, req.file.originalname);
    await fs.rename(tempFilePath, inputFilePath);

    // Initialize job status in Redis
    const initialStatus = {
      status: 'queued',
      progress: 0,
      outputUrl: `/api/v1/upload/download/${jobId}`,
      updatedAt: new Date().toISOString()
    };
    
    await redisClient.set(`job:${jobId}`, JSON.stringify(initialStatus), {
      EX: 600 // 10 minutes TTL
    });

    // Enqueue job in BullMQ
    await uploadQueue.add('process-file', {
      jobId,
      filePath: inputFilePath,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype
    });

    // Clean up temp file immediately
    try {
      await fs.unlink(tempFilePath);
    } catch (error) {
      console.error('Error cleaning up temp file:', error);
    }

    res.status(200).json({
      jobId,
      message: 'File uploaded and queued for processing',
      originalName: req.file.originalname
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up any temporary files on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file on error:', cleanupError);
      }
    }

    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// GET /status/:jobId - Get job status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const jobStatus = await getJobStatus(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId,
      ...jobStatus
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

// GET /download/:jobId - Download processed file
router.get('/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const jobStatus = await getJobStatus(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobStatus.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Job not completed', 
        status: jobStatus.status,
        progress: jobStatus.progress 
      });
    }

    const outputDir = join(jobsDir, jobId, 'output');
    
    try {
      const files = await fs.readdir(outputDir);
      
      if (files.length === 0) {
        return res.status(404).json({ error: 'No output files found' });
      }

      // For now, download the first file found
      // In a real implementation, you might want to handle multiple output files
      const outputFile = files[0];
      const outputFilePath = join(outputDir, outputFile);
      
      // Set appropriate headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${outputFile}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Stream the file to response
      const fileStream = fs.createReadStream(outputFilePath);
      fileStream.pipe(res);
      
      // Clean up job directory after download completes
      fileStream.on('end', async () => {
        try {
          await cleanupJobDirectory(jobId);
          await deleteJobData(jobId);
        } catch (cleanupError) {
          console.error('Error cleaning up after download:', cleanupError);
        }
      });

    } catch (dirError) {
      console.error('Error reading output directory:', dirError);
      res.status(500).json({ error: 'Failed to read output files' });
    }

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 500 MB.' });
    }
    return res.status(400).json({ error: 'File upload error', details: error.message });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
});

export default router;
