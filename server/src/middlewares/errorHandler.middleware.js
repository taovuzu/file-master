import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  }

  // Add path information
  error.path = req.originalUrl;
  
  console.log(error.stack);
  
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    code: error.code,
    errors: error.errors,
    timestamp: error.timestamp,
    path: error.path
  };

  return res.status(error.statusCode).json(response);
};