import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { validateFilePdf, docToPdfValidator } from "../validators/conversion.validator.js";
import { convertDocToPdf, convertImagesToPdf} from "../controllers/converter.controller.js"
// , convertPdfToPptx, convertPdfToImage 
const router = Router();

router.route("/doc-to-pdf").post(upload.single("DOCFILE"), docToPdfValidator, convertDocToPdf);
router.route("/image-to-pdf").post(upload.array("IMAGEFILE"), convertImagesToPdf);
// router.route("/pdf-to-docx").post(upload.single("PDFFILE"),validateFilePdf, convertPdfToDoc);
// router.route("/pdf-to-pptx").post(upload.single("PDFFILE"), validateFilePdf, convertPdfToPptx);
// router.route("/pdf-to-xlsx").post(upload.single("PDFFILE"),validateFilePdf, convertPdfToXlsx);
// router.route("/pdf-to-images").post(upload.single("PDFFILE"), validateFilePdf, convertPdfToImage);

export default router;