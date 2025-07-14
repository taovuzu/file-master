import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { addTextWatermark } from "../controllers/addTextWatermark.controller.js";

const router = Router();

router.post( "/text", upload.single("PDFFILE"), addTextWatermark );

export default router;
