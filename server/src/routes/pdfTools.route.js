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
import { verifyCSRF, getUserLoggedInOrNot } from "../middlewares/auth.middleware.js";
const router = Router();

router.use(getUserLoggedInOrNot);

router.post("/compress", compressPdf);
router.post("/merge", mergePdfFiles);
router.post("/watermark/text", addTextWatermark);

router.post("/page-numbers", AddPageNumber);
router.post("/convert/doc-to-pdf", convertDocToPdf);
router.post("/convert/images-to-pdf", upload.array('IMAGEFILE', 20), convertImagesToPdf);
router.post("/convert/pdf-to-doc", convertPdfToDoc);

router.post("/convert/pdf-to-ppt", convertPdfToPpt);
router.post("/rotate", rotatePdf);
router.post("/split", splitPdf);
router.post("/protect", protectPdf);
router.post("/unlock", unlockPdf);

export default router;