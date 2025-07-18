import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { addTextWatermark, addImageWatermark } from "../controllers/addWatermark.controller.js";
const router = Router();

router.post("/text", upload.single("PDFFILE"), addTextWatermark);
router.post("/image", upload.fields([{
  name: 'PDFFILE', maxCount: 1
}, {
  name: 'WATERMARKIMAGE', maxCount: 1
}]), addImageWatermark);


export default router;
