import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { AddPageNumber } from "../controllers/addPageNumber.controller.js";

const router = Router();

router.post( "/pdf", upload.single("PDFFILE"), AddPageNumber);

export default router;
