import { Router } from "express";
import { upload} from "../middlewares/multer.middleware.js";
import { convertDocToPdf } from "../controllers/docToPdf.controller.js"
import { docToPdfValidator } from "../validators/conversion.validator.js";
import { convertImagesToPdf } from "../controllers/imageToPdf.controller.js";
import { validateFilePdf } from "../validators/conversion.validator.js";
import { convertPdfToDoc, convertPdfToPptx, convertPdfToXlsx} from "../controllers/pdfToDoc.controller.js"

const router = Router();

router.route("/doc-to-pdf").post(upload.single("DOCFILE"),docToPdfValidator, convertDocToPdf);
router.route("/image-to-pdf").post(upload.array("IMAGEFILES"), convertImagesToPdf);
router.route("/pdf-to-docx").post(upload.single("PDFFILE"),validateFilePdf, convertPdfToDoc);
router.route("/pdf-to-pptx").post(upload.single("PDFFILE"),validateFilePdf, convertPdfToPptx);
router.route("/pdf-to-xlsx").post(upload.single("PDFFILE"),validateFilePdf, convertPdfToXlsx);
router.route("/pdf-to-images").post();

export default router;