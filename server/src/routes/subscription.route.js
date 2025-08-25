import { Router } from "express";
import { 
  createSubscription, 
  verifyPayment, 
  cancelSubscription, 
  getSubscriptionDetails, 
  getSubscriptionPlans,
  webhookHandler 
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/plans").get(getSubscriptionPlans);
router.route("/webhook").post(webhookHandler);

// Protected routes
router.route("/create").post(verifyJWT, createSubscription);
router.route("/verify").post(verifyJWT, verifyPayment);
router.route("/cancel").post(verifyJWT, cancelSubscription);
router.route("/details").get(verifyJWT, getSubscriptionDetails);

export default router;
