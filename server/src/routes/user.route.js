import { Router } from "express";
import { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, forgotPasswordRequest, changeCurrentPassword, resetForgottenPassword, getCurrentUser, resendEmailVerification, updateUserProfile } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { emailValidator, usernameValidator, passwordValidator, userLoginValidator, userRegisterValidator, changeCurrentPasswordValidator, resetForgottenPasswordValidator } from "../validators/user.validator.js";
import { validate } from "../validators/validate.js";
import passport from "passport";
import "../middlewares/passport.js";

const router = Router();

router.route("/register-email").post(emailValidator(), validate, registerEmail);
router.route("/register-user").post(userRegisterValidator(), validate, registerUser);
router.route("/verify-email-link").get(verifyEmailByLink);
router.route("/verify-email-otp").post(verifyEmailByOTP);
router.route("/login").post(userLoginValidator(), loginUser);
router.route("/resend-verification").post(resendEmailVerification);
router.route("/request-password-reset").post(emailValidator(), validate, forgotPasswordRequest);
router.route("/reset-forgot-password").post(resetForgottenPasswordValidator(), validate, resetForgottenPassword);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/profile").put(verifyJWT, updateUserProfile);
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