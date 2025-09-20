import { Router } from "express";
import { createPresignedPutUrl } from "../utils/s3.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v4 as uuidv4 } from "uuid";
import { enforceUsageLimits } from "../middlewares/usageLimit.middleware.js";
import { getUserLoggedInOrNot } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(getUserLoggedInOrNot);
router.use(enforceUsageLimits);

router.post("/presign", asyncHandler(async (req, res) => {
  const { fileName, contentType } = req.body || {};
  if (!fileName || !contentType) {
    return res.status(400).json({ success: false, message: "fileName and contentType are required" });
  }
  const userId = (req.user && req.user._id) || "anon";
  const key = `uploads/${userId}/${uuidv4()}/${fileName}`;
  const url = await createPresignedPutUrl(key, contentType, 300);
  return res.json({ success: true, key, url, expiresIn: 300 });
}));

export default router;



