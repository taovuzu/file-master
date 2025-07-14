import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { protectPdf } from "../controllers/protectPdf.controller.js";

const router = Router();

router.post("/protect-pdf", upload.single("PDFFILE"), protectPdf);

export default router;
