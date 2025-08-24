import { Router } from "express";
import { checkJobStatus, downloadFile } from "../controllers/download.controller.js";

const router = Router();

router.get("/status/:jobId", checkJobStatus);
router.get("/:jobId", downloadFile);

export default router;
