import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getJobStatus, deleteJobData } from "../queues/pdf.queue.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import path from "path";
import fs from "fs";

import { compressPdf } from "../controllers/compressPdf.controller.js";
import { mergePdfFiles } from "../controllers/mergePdf.controller.js";
import { addTextWatermark, addImageWatermark } from "../controllers/addWatermark.controller.js";
import { AddPageNumber } from "../controllers/addPageNumber.controller.js";
import { convertDocToPdf, convertImagesToPdf, convertPdfToDoc, convertPdfToPpt } from "../controllers/converter.controller.js";
import { rotatePdf } from "../controllers/rotatePdf.controller.js";
import { splitPdf } from "../controllers/splitPdf.controller.js";
import { protectPdf } from "../controllers/protectPdf.controller.js";
import { unlockPdf } from "../controllers/unlockPdf.controller.js";

const router = Router();

router.post("/compress", upload.single("PDFFILE"), compressPdf);
router.post("/merge", upload.array("PDFFILES"), mergePdfFiles);
router.post("/watermark/text", upload.single("PDFFILE"), addTextWatermark);
// router.post("/watermark/image", upload.fields([
//   { name: 'PDFFILE', maxCount: 1 },
//   { name: 'IMAGEFILE', maxCount: 1 }
// ]), addImageWatermark);
router.post("/page-numbers", upload.single("PDFFILE"), AddPageNumber);
router.post("/convert/doc-to-pdf", upload.single("DOCFILE"), convertDocToPdf);
router.post("/convert/images-to-pdf", upload.array("IMAGEFILE"), convertImagesToPdf);
// router.post("/convert/pdf-to-doc", upload.single("PDFFILE"), convertPdfToDoc);
router.post("/convert/pdf-to-ppt", upload.single("PDFFILE"), convertPdfToPpt);
router.post("/rotate", upload.single("PDFFILE"), rotatePdf);
router.post("/split", upload.single("PDFFILE"), splitPdf);
router.post("/protect", upload.single("PDFFILE"), protectPdf);
router.post("/unlock", upload.single("PDFFILE"), unlockPdf);

// Centralized Status Endpoint
router.get("/status/:jobId", asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  if (!jobId) {
    throw new ApiError(400, "Job ID is required");
  }

  const jobStatus = await getJobStatus(jobId);
  
  if (!jobStatus) {
    throw new ApiError(404, "Job not found");
  }

  res.json({
    jobId,
    ...jobStatus
  });
}));

router.get("/download/:jobId", asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  if (!jobId) {
    throw new ApiError(400, "Job ID is required");
  }

  const jobStatus = await getJobStatus(jobId);
  
  if (!jobStatus) {
    throw new ApiError(404, "Job not found");
  }

  if (jobStatus.status !== 'completed') {
    throw new ApiError(400, "Job not completed", {
      status: jobStatus.status,
      progress: jobStatus.progress
    });
  }

  const outputDir = path.join(process.cwd(), "public", "processed");
  const files = fs.readdirSync(outputDir);
  
  const outputFile = files.find(file => file.includes(jobId));
  
  if (!outputFile) {
    throw new ApiError(404, "Output file not found");
  }

  const outputPath = path.join(outputDir, outputFile);
  
  const ext = path.extname(outputFile).toLowerCase();
  let contentType = 'application/octet-stream';
  let filename = outputFile;
  
  if (ext === '.pdf') {
    contentType = 'application/pdf';
  } else if (ext === '.zip') {
    contentType = 'application/zip';
  } else if (ext === '.docx') {
    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (ext === '.pptx') {
    contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  }
  
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', contentType);
  
  const fileStream = fs.createReadStream(outputPath);
  fileStream.pipe(res);
  
  fileStream.on('end', async () => {
    try {
      fs.unlinkSync(outputPath);
      await deleteJobData(jobId);
      console.log(`File cleaned up after download: ${outputPath}`);
    } catch (cleanupError) {
      console.error('Error cleaning up after download:', cleanupError);
    }
  });
}));

export default router;
