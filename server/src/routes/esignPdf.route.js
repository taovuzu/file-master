import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { signPdf } from "../controllers/eSignPdf.controller.js";

const router = Router();

router.post("/esign-pdf", upload.fields([
  { name: "PDFFILE", maxCount: 1 },
  { name: "SIGNATURE", maxCount: 1 },
])
  , signPdf);

export default router;
