import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";

const extractToken = (req) => {
  return (
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", ""));

};

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ApiError(401, "JsonWebTokenError");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
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
    req.user = decoded;
    next();
  } catch (error) {
    next();
  }
});

const verifyCSRF = asyncHandler(async (req, res, next) => {
  const method = (req.method || '').toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return next();
  }

  const cookieToken = req.cookies && req.cookies['csrf-token'];
  const headerToken = req.headers && (req.headers['x-csrf-token'] || req.headers['X-CSRF-Token']);

  if (!cookieToken || !headerToken || String(cookieToken) !== String(headerToken)) {
    throw new ApiError(403, "Invalid CSRF token");
  }
  next();
});

export { verifyJWT, getUserLoggedInOrNot, verifyCSRF };