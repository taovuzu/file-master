import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { splitPdf } from "../controllers/splitPdf.controller.js";

const router = Router();

router.post("/pdf", upload.single("PDFFILE"), splitPdf);

export default router;
 