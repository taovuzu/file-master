import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const extractToken = (req) => {
  return (
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "")
  );
};

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ApiError(401, "JsonWebTokenError");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken -forgetPasswordExpiry -forgetPasswordToken -isUsernameChanged"
    );

    if (!user) {
      throw new ApiError(401, "JsonWebTokenError");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, { message: "TokenExpiredError", jwtExpired: true });
    }
    throw new ApiError(401, "JsonWebTokenError");
  }
});

const getUserLoggedInOrNot = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry -isUsernameChanged"
    );

    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
});

export { verifyJWT, getUserLoggedInOrNot };