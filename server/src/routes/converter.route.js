import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { validateFilePdf, docToPdfValidator } from "../validators/conversion.validator.js";
import { convertDocToPdf, convertImagesToPdf, convertPdfToPptx} from "../controllers/converter.controller.js"
const router = Router();

router.route("/doc-to-pdf").post(upload.single("DOCFILE"), docToPdfValidator, convertDocToPdf);
router.route("/image-to-pdf").post(upload.array("IMAGEFILE", 20), convertImagesToPdf);
// router.route("/pdf-to-docx").post(upload.single("PDFFILE"),validateFilePdf, convertPdfToDoc);
router.route("/pdf-to-pptx").post(upload.single("PDFFILE"), validateFilePdf, convertPdfToPptx);
// router.route("/pdf-to-xlsx").post(upload.single("PDFFILE"),validateFilePdf, convertPdfToXlsx);

export default router;