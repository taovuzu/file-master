import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(requestIp.mw());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp;
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});
app.use(limiter);
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static("public"));

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  console.log(`Client IP: ${req.clientIp}`);
  next();
});


// import converterRouter from "./routes/converter.route.js";
// import mergePdfRouter from "./routes/mergePdf.route.js";
import splitPdfRouter from "./routes/splitPdf.route.js";
import compressPdfRouter from "./routes/compressPdf.route.js";
import rotatePdfRouter from "./routes/rotatePdf.route.js";
import pageNumbersRouter from "./routes/pageNumbers.route.js";
// import watermarkRouter from "./routes/watermark.route.js";
// import esignPdfRouter from "./routes/esignPdf.route.js";
import unlockPdfRouter from "./routes/unlockPdf.route.js";
import protectPdfRouter from "./routes/protectPdf.route.js";
import downloadFileRouter from "./routes/download.route.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";


// app.use("/api/v1/convert", converterRouter); // image-to-pdf -> {PDFDocument from "pdfkit"}, doc-to-pdf -> {libreoffice}
// // pdf-to-ppt -> {pptxgen, pdf-poppler, pdf-lib}
// app.use("/api/v1/merge", mergePdfRouter); //  PDFMerger from "pdf-merger-js";
app.use("/api/v1/split", splitPdfRouter); // { PDFDocument } from "pdf-lib";
app.use("/api/v1/compress", compressPdfRouter); // ghostscript
app.use("/api/v1/rotate", rotatePdfRouter); // { PDFDocument, degrees } from "pdf-lib";
app.use("/api/v1/page-numbers", pageNumbersRouter); // { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// app.use("/api/v1/watermark", watermarkRouter); //  { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
// app.use("/api/v1/esign", esignPdfRouter); // { PDFDocument } from 'pdf-lib';
app.use("/api/v1/unlock", unlockPdfRouter); // ghostscript
app.use("/api/v1/protect", protectPdfRouter); // gostscript
app.use("/api/v1/download", downloadFileRouter);


app.use(errorHandler);

export { app };