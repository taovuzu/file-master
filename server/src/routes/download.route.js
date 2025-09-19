import { Router } from "express";
import { checkJobStatus, downloadFile } from "../controllers/download.controller.js";
import { getUserLoggedInOrNot } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(getUserLoggedInOrNot);

router.get("/status/:jobId", checkJobStatus);
router.get("/:jobId", downloadFile);

export default router;