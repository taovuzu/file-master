import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import { compressPdf } from "../controllers/compressPdf.controller.js";
import { mergePdfFiles } from "../controllers/mergePdf.controller.js";
import { addTextWatermark, addImageWatermark } from "../controllers/addWatermark.controller.js";
import { AddPageNumber } from "../controllers/addPageNumber.controller.js";
import { convertDocToPdf, convertImagesToPdf, convertPdfToDoc, convertPdfToPpt } from "../controllers/converter.controller.js";
import { rotatePdf } from "../controllers/rotatePdf.controller.js";
import { splitPdf } from "../controllers/splitPdf.controller.js";
import { protectPdf } from "../controllers/protectPdf.controller.js";
import { unlockPdf } from "../controllers/unlockPdf.controller.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

router.post("/compress", upload.single("PDFFILE"), compressPdf);
router.post("/merge", upload.array("PDFFILE"), mergePdfFiles);
router.post("/watermark/text", upload.single("PDFFILE"), addTextWatermark);




router.post("/page-numbers", upload.single("PDFFILE"), AddPageNumber);
router.post("/convert/doc-to-pdf", upload.single("DOCFILE"), convertDocToPdf);
router.post("/convert/images-to-pdf", upload.array("IMAGEFILE"), convertImagesToPdf);

router.post("/convert/pdf-to-ppt", upload.single("PDFFILE"), convertPdfToPpt);
router.post("/rotate", upload.single("PDFFILE"), rotatePdf);
router.post("/split", upload.single("PDFFILE"), splitPdf);
router.post("/protect", upload.single("PDFFILE"), protectPdf);
router.post("/unlock", upload.single("PDFFILE"), unlockPdf);

export default router;