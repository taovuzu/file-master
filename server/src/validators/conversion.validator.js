import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import AdmZip from "adm-zip";
import mime from 'mime-types';
import readline from "readline";
import { fileTypeFromFile } from "file-type";
import { ApiError } from "../utils/ApiError.js";

const allowedFormats = {
  documents: {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    odt: "application/vnd.oasis.opendocument.text",
    txt: "text/plain",
    rtf: "application/rtf",
    csv: "text/csv",
    html: "text/html",
    xml: "application/xml",
    epub: "application/epub+zip",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    gsheet: "application/vnd.google-apps.spreadsheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
    odp: "application/vnd.oasis.opendocument.presentation",
    gslide: "application/vnd.google-apps.presentation",
    gdoc: "application/vnd.google-apps.document",
    gsheet: "application/vnd.google-apps.spreadsheet",
    gslide: "application/vnd.google-apps.presentation"
  },

  images: {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    tiff: "image/tiff",
    svg: "image/svg+xml",
    webp: "image/webp",
    heic: "image/heic"
  }
};

async function validateFileDoc(filePath) {
  try {
    const filetype = await fileTypeFromFile(filePath);
    const mimeType = await mime.lookup(filePath);
    if (!filetype || !mimeType) {
      throw new ApiError(400, `Unable to detect MIME type || filetype for the file.`);
    }
    const isMimeTypePresent = Object.values(allowedFormats.documents).includes(mimeType);
    if (!isMimeTypePresent) {
      throw new ApiError(400, `Spoofed file detected! got wrong mimetype: ${mimeType}`);
    }

    const actualExtension = filetype.ext.toLowerCase();
    const isActualExtensionPresent = actualExtension in allowedFormats.documents;
    if (!isActualExtensionPresent) {
      throw new ApiError(400, `Extension mismatch! got wrong extensiontype: ${actualExtension}`);
    }
    if (mimeType === "application/pdf") {
      throw new ApiError(400, "file is already in pdf format");
    } else
    if ([allowedFormats.documents.doc, allowedFormats.documents.docx, allowedFormats.documents.xml].includes(mimeType)) {
      const zip = new AdmZip(filePath);
      const entries = zip.getEntries().map((entry) => entry.entryName);
      if (!entries.includes("word/document.xml")) {
        throw new ApiError(400, "Invalid DOCX file structure detected!");
      }

      const xmlData = zip.readAsText('word/document.xml');
      if (xmlData.includes('<macro>')) {
        throw new ApiError(400, "File contains macros, which are not allowed.");
      }
    }
    return true;
  } catch (error) {
    throw new ApiError(500, error.message || "Error while validating File", error);
  }
}

const docToPdfValidator = asyncHandler(async (req, res, next) => {
  try {
    const filePath = req.file?.path;

    if (!filePath) {
      throw new ApiError(500, "filepath not found while validating");
    }

    const validationResult = await validateFileDoc(filePath);
    if (!validationResult) {
      throw new ApiError(400, "Either file contain malicious code or broken");
    }
    next();
  } catch (error) {
    if (req.file?.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
      }
    }
    throw new ApiError(400, error.message || "Error while validating file", error);
  }
});

function getLastNBytes(filePath, n) {
  const stats = fs.statSync(filePath);
  const buffer = Buffer.alloc(n);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, n, stats.size - n);
  fs.closeSync(fd);
  return buffer.toString();
}

async function validatePDF(filePath) {
  try {
    const fileStream = fs.createReadStream(filePath, { start: 0, end: 1024 * 1024 });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let foundPDFHeader = false;
    let suspiciousContentDetected = false;

    for await (const line of rl) {
      if (line.includes('%PDF-')) foundPDFHeader = true;

      if (/<<.*\/(JavaScript|JS|OpenAction|AA|Launch|EmbeddedFile|RichMedia|AcroForm).*>>/i.test(line)) {
        suspiciousContentDetected = true;
        break;
      }
    }

    if (!foundPDFHeader) {
      throw new ApiError(400, 'Invalid PDF structure: Missing %PDF header.');
    }

    if (suspiciousContentDetected) {
      throw new ApiError(400, 'Suspicious embedded content detected in PDF.');
    }

    const eofContent = getLastNBytes(filePath, 1024 * 1024);
    if (!eofContent.includes('%%EOF')) {
      throw new ApiError(400, 'Invalid PDF structure: Missing %%EOF marker.');
    }

    return true;
  } catch (error) {
    throw new ApiError(400, error.message || 'PDF validation failed.', error);
  }
}

const validateFilePdf = asyncHandler(async (req, res, next) => {
  try {
    const filePath = req.file?.path;

    if (!filePath) {
      throw new ApiError(500, "filepath not found while validating");
    }
    const filetype = await fileTypeFromFile(filePath);
    const mimeType = await mime.lookup(filePath);
    if (!filetype || !mimeType) {
      throw new ApiError(400, `Unable to detect MIME type || filetype for the file.`);
    }

    if (mimeType !== "application/pdf") {
      throw new ApiError(400, `Spoofed file detected! got wrong mimetype: ${mimeType}`);
    }

    const actualExtension = filetype.ext.toLowerCase();
    if (actualExtension !== "pdf") {
      throw new ApiError(400, `Extension mismatch! got wrong extensiontype: ${actualExtension}`);
    }
    next();
  } catch (error) {
    if (req.file?.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
      }
    }
    throw new ApiError(400, error.message || "Error while validating file", error);
  }
});

export { docToPdfValidator, validateFilePdf };