import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { mergePdfFiles } from "../controllers/mergePdf.controller.js";

const router = Router();

router.route("/pdf").post(upload.array("PDFFILE", 15), mergePdfFiles);

export default router;
