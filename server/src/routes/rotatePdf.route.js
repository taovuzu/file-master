import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { rotatePdf } from "../controllers/rotatePdf.controller.js";

const router = Router();

router.post("/pdf", upload.array("PDFFILE"), rotatePdf);

export default router;
