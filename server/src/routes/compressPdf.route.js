import { Router } from "express";
import { compressPdf } from "../controllers/compressPdf.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/pdf", upload.single("PDFFILE"), compressPdf);

export default router;
