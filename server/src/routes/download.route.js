import { Router } from "express";

import { downloadFile } from "../controllers/downloadFile.controller.js";

const router = Router();

router.get("/:file", downloadFile);

export default router;
