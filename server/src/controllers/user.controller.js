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

  req.session.email = email;
  req.session.emailVerified = false;

  await sendRegistrationTokens(email, req);

  return ApiResponse
    .success({}, "OTP and verification link sent to email", 200)
    .withRequest(req)
    .send(res);
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const email = req.session.email;
  if (!email) {
    throw ApiError.notFound("Email not found on system");
  }
  await sendRegistrationTokens(email, req);
  console.log("resend success");

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

  if (email != req.session.email || hashedToken != req.session.hashedToken || Date.now() > req.session.tokenExpiry) {
    throw ApiError.notFound("Email or unHashedToken is invalid or expired");
  }

  req.session.emailVerified = true;
  return res.redirect(
    `${process.env.FRONTEND_URL}/register?verified=true&email=${encodeURIComponent(email)}`
  );
});

const verifyEmailByOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp || otp >= 999999 || otp <= 100000) {
    throw ApiError.badRequest("Email or otp is empty or incomplete");
  }

  if (email != req.session.email || otp != req.session.otp || Date.now() > req.session.tokenExpiry) {
    throw ApiError.notFound("Email or otp is invalid or expired");
  }

  req.session.emailVerified = true;
  return ApiResponse
    .success({}, "Email verified successfully by otp", 200)
    .withRequest(req)
    .send(res);
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, password } = req.body;

  if (!req.session.email || !req.session.emailVerified) {
    throw ApiError.badRequest("Email is not verified yet");
  }

  if (!fullName || !password) {
    throw ApiError.badRequest("All fields are required");
  }

  const existingUser = await User.findOne({ email: req.session.email });
  if (existingUser) {
    throw new ApiError.conflict("Account already exists with this email");
  }

  let user;
  try {
    user = await User.create({
      email: req.session.email,
      fullName,
      password
    });
  } catch (error) {
    throw ApiError.internal("Failed to create user", [error]);
  }


  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const createdUser = await User.findById(user._id).select("-password -refreshToken");


  req.session.email = null;
  req.session.emailVerified = null;
  req.session.hashedToken = null;
  req.session.otp = null;
  req.session.tokenExpiry = null;

  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };

  const response = ApiResponse.created({ createdUser, accessToken, refreshToken }, "Account created successfully").withRequest(req);
  return res
    .status(response.statusCode)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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

  const response = ApiResponse.success({ loggedInUser, accessToken, refreshToken }, "User loggedIn successfully", 200).withRequest(req);
  return res
    .status(response.statusCode)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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

    const response = ApiResponse.success({ accessToken, refreshToken }, "refreshed accessToken successfully", 200).withRequest(req);
    return res
      .status(response.statusCode)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
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

  return res.
  status(200).
  cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' }).
  cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' }).
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

  console.log(resetLink);

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

  console.log(email, unHashedToken, newPassword);
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
    )
  });
};

export { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, changeCurrentPassword, forgotPasswordRequest, resetForgottenPassword, getCurrentUser, resendEmailVerification };