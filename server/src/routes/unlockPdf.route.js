import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { unlockPdf } from "../controllers/unlockPdf.controller.js";

const router = Router();

router.post("/unlock-pdf", upload.single("PDFFILE"), unlockPdf);

export default router;
