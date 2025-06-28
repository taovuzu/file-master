import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  }

  error.path = req.originalUrl;

  logger.error('Application error occurred', {
    error: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    path: error.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  const isProduction = process.env.NODE_ENV === 'production';
  
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: isProduction ? "An unexpected error occurred. Please try again." : error.message,
    ...(isProduction ? {} : { 
      code: error.code,
      errors: error.errors,
      path: error.path 
    }),
    timestamp: error.timestamp
  };

  return res.status(error.statusCode).json(response);
};