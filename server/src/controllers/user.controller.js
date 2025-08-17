import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { USERLOGIN_TYPES } from "../constants.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendEmail, emailVerificationMailgen, forgetPasswordMailgen } from "../utils/mail.js";
import { request } from "http";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.forgetPasswordToken = undefined;
    user.forgetPasswordExpiry = undefined;
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens",
      error
    );
  }
};

const registerEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is empty");

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, "User already exists with this email");

  req.session.email = email;
  req.session.emailVerified = false;

  await sendRegistrationTokens(email, req);

  return res.status(200).json(
    new ApiResponse(200, {}, "OTP and verification link sent to email")
  );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const email = req.session.email;
  if (!email) {
    throw new ApiError(404, "Email not found on system");
  }
  await sendRegistrationTokens(email, req);
  console.log("resend success");

  return res.status(200).json(new ApiResponse(200, "OTP and verification link sent to email"));
});

const verifyEmailByLink = asyncHandler(async (req, res) => {
  const { email, unHashedToken } = req.query;

  if (!email || !unHashedToken) {
    throw new ApiError(400, "Email or unHashedToken is empty");
  }
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  if (email != req.session.email || hashedToken != req.session.hashedToken || Date.now() > req.session.tokenExpiry) {
    throw new ApiError(404, "Email or unHashedToken is invalid or expired");
  }

  req.session.emailVerified = true;
  return res.redirect(
    `${process.env.FRONTEND_URL}/register?verified=true&email=${encodeURIComponent(email)}`
  );
});

const verifyEmailByOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp || otp >= 999999 || otp <= 100000) {
    throw new ApiError(400, "Email or otp is empty or incomplete");
  }

  if (email != req.session.email || otp != req.session.otp || Date.now() > req.session.tokenExpiry) {
    throw new ApiError(404, "Email or otp is invalid or expired");
  }

  req.session.emailVerified = true;
  return res.status(200).json(new ApiResponse(200, "", "Email verified successfully by otp"));
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, password } = req.body;

  if (!req.session.email || !req.session.emailVerified) {
    throw new ApiError(400, "Email is not verified yet");
  }

  if (!fullName || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email: req.session.email });
  if (existingUser) {
    throw new ApiError(409, "Account already exists with this email");
  }

  let user;
  try {
    user = await User.create({
      email: req.session.email,
      fullName,
      password,
    });
  } catch (error) {
    throw new ApiError(500, "Failed to create user", error);
  }

  // generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  // clear session verification data
  req.session.email = null;
  req.session.emailVerified = null;
  req.session.hashedToken = null;
  req.session.otp = null;
  req.session.tokenExpiry = null;

  const options = { httpOnly: true, secure: true };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(201, { createdUser, accessToken, refreshToken }, "Account created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "No user exists with provided email or username");
  }


  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken -forgetPasswordToken -forgetPasswordExpiry");

  const options = {
    httponly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "User loggedIn successfully"));

});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorised request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh tokens");
    }
    if (incomingRefreshToken != user.refreshToken) {
      throw new ApiError(401, "Refresh token are expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
      httponly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "refreshed accessToken successfully"));


  } catch (error) {
    throw new ApiError(401, "Either invalid or expired refresh tokens" || error?.message);
  }

});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: "" } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User loggedOut successfully"));

});

const userSocialLogin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new ApiError(404, "In social login request can not get user.id or user does not exists");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const options = {
    httponly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "Strict" })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" })
    .redirect(`${process.env.CLIENT_SSO_REDIRECT_URL}/auth/callback?success=true`);
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(409, "Old passpord is wrong");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User password changed successfully"));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is empty");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "User does not exist");

  const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.forgetPasswordToken = hashedToken;
  user.forgetPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}&unHashedToken=${unHashedToken}`;

  console.log(resetLink);

  await sendEmail({
    email,
    subject: "Password Reset Token",
    mailgenContent: forgetPasswordMailgen(resetLink),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset link sent successfully"));
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, unHashedToken, newPassword } = req.body;

  console.log(email, unHashedToken, newPassword);
  if (!email || !unHashedToken || !newPassword) {
    throw new ApiError(400, "Email, token, or new password is missing");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const user = await User.findOne({
    email,
    forgetPasswordToken: hashedToken,
    forgetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(404, "Invalid token, expired, or user does not exist");
  }

  user.password = newPassword;
  user.forgetPasswordToken = undefined;
  user.forgetPasswordExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const options = { httpOnly: true, secure: true, sameSite: "None" };
  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const sendRegistrationTokens = async (email, req) => {
  const otp = crypto.randomInt(100000, 999999);

  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + process.env.USER_TEMPORARY_TOKEN_EXPIRY;

  req.session.otp = otp;
  req.session.email = email;
  req.session.hashedToken = hashedToken;
  req.session.tokenExpiry = tokenExpiry;

  console.log(otp);
  console.log(`${req.protocol}://${req.get("host")}/api/v1/users/verify-email-link?email=${encodeURIComponent(email)}&unHashedToken=${unHashedToken}`);
  await sendEmail({
    email: email,
    subject: "Email Verification Tokens",
    mailgenContent: emailVerificationMailgen(
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email-link?email=${encodeURIComponent(email)}&unHashedToken=${unHashedToken}`,
      otp
    ),
  });
};


export { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, changeCurrentPassword, forgotPasswordRequest, resetForgottenPassword, getCurrentUser, resendEmailVerification };