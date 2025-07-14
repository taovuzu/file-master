import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { splitPdf } from "../controllers/splitPdf.controller.js";

const router = Router();

router.post("/pdf", upload.array("PDFFILE"), splitPdf);

export default router;
 