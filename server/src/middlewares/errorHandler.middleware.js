import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  };
  console.log(error.stack);
  return res.status(error.statusCode).json(new ApiResponse(error.statusCode, error.errors || [], error.message));
}