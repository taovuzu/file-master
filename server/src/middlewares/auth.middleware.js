import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";


const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "JsonWebTokenError");
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken -forgetPasswordExpiry -forgetPasswordToken -isUsernameChanged");
    if (!user) {
      throw new ApiError(401, "JsonWebTokenError");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "JsonWebTokenError");
  }
});

const getUserLoggedInOrNot = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) next();
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry -isUsernameChanged");
    req.user = user;
    next();
  } catch (error) {
    next();
  }
})


export { verifyJWT, getUserLoggedInOrNot };