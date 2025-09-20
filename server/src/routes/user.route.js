import { Router } from "express";
import { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, forgotPasswordRequest, changeCurrentPassword, resetForgottenPassword, getCurrentUser, resendEmailVerification } from "../controllers/user.controller.js";
import { verifyJWT, verifyCSRF } from "../middlewares/auth.middleware.js";
import { emailValidator, usernameValidator, passwordValidator, userLoginValidator, userRegisterValidator, changeCurrentPasswordValidator, resetForgottenPasswordValidator } from "../validators/user.validator.js";
import { validate } from "../validators/validate.js";
import passport from "passport";
import { sensitiveRateLimiter } from "../middlewares/rateLimit.middleware.js";
import "../middlewares/passport.js";

const router = Router();

router.route("/register-email").post(sensitiveRateLimiter({ max: 20, windowMs: 15 * 60 * 1000 }), emailValidator(), validate, registerEmail);
router.route("/register-user").post(sensitiveRateLimiter({ max: 30, windowMs: 15 * 60 * 1000 }), userRegisterValidator(), validate, registerUser);
router.route("/verify-email-link").get(verifyEmailByLink);
router.route("/verify-email-otp").post(sensitiveRateLimiter({ max: 10, windowMs: 10 * 60 * 1000 }), verifyEmailByOTP);
router.route("/login").post(sensitiveRateLimiter({ max: 10, windowMs: 10 * 60 * 1000 }), userLoginValidator(), loginUser);
router.route("/resend-verification").post(sensitiveRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }), resendEmailVerification);
router.route("/request-password-reset").post(sensitiveRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }), emailValidator(), validate, forgotPasswordRequest);
router.route("/reset-forgot-password").post(sensitiveRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }), resetForgottenPasswordValidator(), validate, resetForgottenPassword);

router.route("/logout").post(verifyJWT, verifyCSRF, logoutUser);
router.route("/change-password").post(verifyJWT, verifyCSRF, changeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/refresh-access-token").get(refreshAccessToken);

router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  }),
  (req, res) => {
    res.send("Redirecting to google...");
  }
);

router.route("/google/callback").get(
  passport.authenticate("google", { session: false }),
  userSocialLogin
);

export default router;