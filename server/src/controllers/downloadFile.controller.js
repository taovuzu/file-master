import { existsSync } from 'fs';

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const downloadFile = asyncHandler(async (req, res) => {
  const { file } = req.params;
  const filePath = "public\\processed\\" + file;
  if (!existsSync(filePath)) {
    throw new ApiError(404, "file does not exist")
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