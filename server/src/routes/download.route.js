import { Router } from "express";

import { downloadFile } from "../controllers/downloadFile.controller.js";
import { enforceUsageLimits } from "../middlewares/usageLimit.middleware.js";

const router = Router();

router.get("/:file", enforceUsageLimits, downloadFile);

export default router;
