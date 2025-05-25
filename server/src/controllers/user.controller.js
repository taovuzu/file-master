import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { USERLOGIN_TYPES } from "../constants.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendEmail, emailVerificationMailgen, forgetPasswordMailgen } from "../utils/mail.js";
import { request } from "http";
import { redisClient, healthCheck } from "../queues/pdf.queue.js";
import logger from "../utils/logger.js";

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
    throw ApiError.internal("Something went wrong while generating access and refresh tokens", [error]);
  }
};

const registerEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest("Email is empty");

  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict("User already exists with this email");

  await sendRegistrationTokens(email, req);

  return ApiResponse
    .success({}, "OTP and verification link sent to email", 200)
    .withRequest(req)
    .send(res);
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    throw ApiError.badRequest("Email is empty");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict("User already exists with this email");

  await sendRegistrationTokens(email, req);

  return ApiResponse
    .success({}, "OTP and verification link sent to email", 200)
    .withRequest(req)
    .send(res);
});

const verifyEmailByLink = asyncHandler(async (req, res) => {
  const { email, unHashedToken } = req.query;

  if (!email || !unHashedToken) {
    throw ApiError.badRequest("Email or unHashedToken is empty");
  }

  const hashedToken = crypto.
  createHash("sha256").
  update(unHashedToken).
  digest("hex");

  await healthCheck();
  const key = `email:verify:${email}`;
  const data = await redisClient.hGetAll(key);
  if (!data || Object.keys(data).length === 0) {
    throw ApiError.notFound("Verification token not found or expired");
  }
  if (data.hashedToken !== hashedToken) {
    throw ApiError.unauthorized("Invalid verification token");
  }

  const registrationToken = issueRegistrationToken(email);


  return res.redirect(
    `${process.env.FRONTEND_URL}/register?verified=true&email=${encodeURIComponent(email)}&registrationToken=${registrationToken}`
  );
});

const verifyEmailByOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp || Number(otp) >= 999999 || Number(otp) <= 100000) {
    throw ApiError.badRequest("Email or otp is empty or incomplete");
  }

  await healthCheck();
  const key = `email:verify:${email}`;
  const data = await redisClient.hGetAll(key);
  if (!data || Object.keys(data).length === 0) {
    throw ApiError.notFound("OTP not found or expired");
  }
  if (String(data.otp) !== String(otp)) {
    throw ApiError.unauthorized("Invalid OTP");
  }

  const registrationToken = issueRegistrationToken(email);
  return ApiResponse
    .success({ registrationToken }, "Email verified successfully by otp", 200)
    .withRequest(req)
    .send(res);
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, password, registrationToken } = req.body;

  if (!fullName || !password) {
    throw ApiError.badRequest("All fields are required");
  }

  const token = registrationToken || req.headers["x-registration-token"] || req.query?.registrationToken;
  if (!token) {
    throw ApiError.unauthorized("Missing registration token. Verify email first.");
  }

  const secret = process.env.REGISTRATION_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (e) {
    throw ApiError.unauthorized("Invalid or expired registration token");
  }

  const email = decoded?.email;
  if (!email) throw ApiError.unauthorized("Invalid registration token payload");

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict("Account already exists with this email");
  }

  let user;
  try {
    user = await User.create({
      email,
      fullName,
      password
    });
  } catch (error) {
    throw ApiError.internal("Failed to create user", [error]);
  }

  try { await redisClient.del(`email:verify:${email}`); } catch (_) {}

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };
  const csrfToken = crypto.randomBytes(100).toString('hex');
  const csrfCookie = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };

  const response = ApiResponse.created({ createdUser, accessToken, refreshToken }, "Account created successfully").withRequest(req);
  return res
    .status(response.statusCode)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("csrf-token", csrfToken, csrfCookie)
    .json(response.toJSON());
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.notFound("No user exists with provided email or username");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken -forgetPasswordToken -forgetPasswordExpiry");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
  };
  const csrfToken = crypto.randomBytes(100).toString('hex');
  const csrfCookie = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };

  const response = ApiResponse.success({ loggedInUser, accessToken, refreshToken }, "User loggedIn successfully", 200).withRequest(req);
  return res
    .status(response.statusCode)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("csrf-token", csrfToken, csrfCookie)
    .json(response.toJSON());
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.headers["x-refresh-token"] ||
    req.query?.refreshToken;

  if (!incomingRefreshToken) {
    throw ApiError.unauthorized("Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw ApiError.unauthorized("Invalid refresh tokens");
    }
    if (incomingRefreshToken != user.refreshToken) {
      throw ApiError.unauthorized("Refresh token are expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    };
    const csrfToken = crypto.randomBytes(100).toString('hex');
    const csrfCookie = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };

    const response = ApiResponse.success({ accessToken, refreshToken }, "refreshed accessToken successfully", 200).withRequest(req);
    return res
      .status(response.statusCode)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .cookie("csrf-token", csrfToken, csrfCookie)
      .json(response.toJSON());

  } catch (error) {
    throw ApiError.unauthorized("Either invalid or expired refresh tokens");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: "" } },
    { new: true }
  );

  const response = ApiResponse.success({}, "User loggedOut successfully", 200).withRequest(req);
  return res
    .status(response.statusCode)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .clearCookie("csrf-token")
    .json(response.toJSON());
});

const userSocialLogin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw ApiError.notFound("In social login request can not get user.id or user does not exists");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const options = {
    httpOnly: true,
    secure: true
  };
  const csrfToken = crypto.randomBytes(100).toString('hex');
  const csrfCookie = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };

  return res.
  status(200).
  cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' }).
  cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' }).
  cookie("csrf-token", csrfToken, csrfCookie).
  redirect(`${process.env.CLIENT_SSO_REDIRECT_URL}/auth/callback?success=true`);
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw ApiError.conflict("Old passpord is wrong");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return ApiResponse
    .success({}, "User password changed successfully", 200)
    .withRequest(req)
    .send(res);
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest("Email is empty");

  const user = await User.findOne({ email });
  if (!user) throw ApiError.notFound("User does not exist");

  const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.forgetPasswordToken = hashedToken;
  user.forgetPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}&unHashedToken=${unHashedToken}`;

  logger.info('Password reset link generated', { email });

  await sendEmail({
    email,
    subject: "Password Reset Token",
    mailgenContent: forgetPasswordMailgen(resetLink)
  });

  return ApiResponse
    .success({}, "Password reset link sent successfully", 200)
    .withRequest(req)
    .send(res);
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, unHashedToken, newPassword } = req.body;

  logger.info('Password reset attempt', { email });
  if (!email || !unHashedToken || !newPassword) {
    throw ApiError.badRequest("Email, token, or new password is missing");
  }

  const hashedToken = crypto.
  createHash("sha256").
  update(unHashedToken).
  digest("hex");

  const user = await User.findOne({
    email,
    forgetPasswordToken: hashedToken,
    forgetPasswordExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw ApiError.notFound("Invalid token, expired, or user does not exist");
  }

  user.password = newPassword;
  user.forgetPasswordToken = undefined;
  user.forgetPasswordExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };
  res.
  cookie("accessToken", accessToken, options).
  cookie("refreshToken", refreshToken, options);

  return ApiResponse
    .success({}, "Password reset successfully", 200)
    .withRequest(req)
    .send(res);
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return ApiResponse
    .success(req.user, "current user fetched successfully", 200)
    .withRequest(req)
    .send(res);
});

const sendRegistrationTokens = async (email, req) => {
  const otp = crypto.randomInt(100000, 999999);

  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.
  createHash("sha256").
  update(unHashedToken).
  digest("hex");

  const expiryMs = Number(process.env.USER_TEMPORARY_TOKEN_EXPIRY) || (15 * 60 * 1000);
  const ttlSeconds = Math.ceil(expiryMs / 1000);

  await healthCheck();
  const key = `email:verify:${email}`;
  await redisClient.hSet(key, {
    otp: String(otp),
    hashedToken,
    createdAt: new Date().toISOString()
  });
  await redisClient.expire(key, ttlSeconds);

  const verifyUrl = `${process.env.FRONTEND_URL}/api/v1/users/verify-email-link?email=${encodeURIComponent(email)}&unHashedToken=${unHashedToken}`;
  logger.info('Email verification tokens generated', { email, otp });
  await sendEmail({
    email: email,
    subject: "Email Verification Tokens",
    mailgenContent: emailVerificationMailgen(
      verifyUrl,
      otp
    )
  });
};

const issueRegistrationToken = (email) => {
  const secret = process.env.REGISTRATION_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;
  return jwt.sign({ email, purpose: "registration" }, secret, { expiresIn: "15m" });
};

export { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, changeCurrentPassword, forgotPasswordRequest, resetForgottenPassword, getCurrentUser, resendEmailVerification };