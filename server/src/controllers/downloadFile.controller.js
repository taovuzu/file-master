import { existsSync } from 'fs';
import path from 'path';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const downloadFile = asyncHandler(async (req, res) => {
  const { file } = req.params;

  if (!file) {
    throw new ApiError.badRequest('File parameter is required');
  }

  const filePath = path.join(process.cwd(), "public", "processed", file);

  try {
    if (!existsSync(filePath)) {
      throw new ApiError.notFound("File does not exist");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError.internal("Error checking file existence");
  }

  const match = file.match(/^.+___(.+)$/);
  const newFileName = match ? match[1] : file;

  return res.status(200).download(filePath, newFileName, (err) => {
    if (err) {
      console.error("File download failed:", err);
    } else {
      console.log("File downloaded successfully.");
    }
  });
});

export { downloadFile };