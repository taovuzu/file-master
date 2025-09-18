import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { globalSlowDown, sensitiveRateLimiter } from "./middlewares/rateLimit.middleware.js";
import requestIp from "request-ip";
import passport from "passport";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(requestIp.mw());

app.use(globalSlowDown({ windowMs: 15 * 60 * 1000, threshold: 100 }));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static("public"));



import "./middlewares/passport.js";
app.use(passport.initialize());

console.log("App booted up");

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  console.log(`Client IP: ${req.clientIp}`);
  next();
});

import userRouter from "./routes/user.route.js";
import pdfToolsRouter from "./routes/pdfTools.route.js";
import downloadRouter from "./routes/download.route.js";
import healthRouter from "./routes/health.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { enforceUsageLimits } from "./middlewares/usageLimit.middleware.js";
import { uploadLimitMiddleware } from "./middlewares/uploadLimit.middleware.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/pdf-tools", uploadLimitMiddleware, pdfToolsRouter);
app.use("/api/v1/download", downloadRouter);
app.use("/api/v1/health", healthRouter);

app.use(errorHandler);

export { app };

// image-to-pdf -> { PDFDocument from "pdf-lib" }
// doc-to-pdf -> { libreoffice }
// pdf-to-ppt -> { pptxgenjs, pdf-poppler, pdf-lib }
// merge -> { PDFMerger from "pdf-merger-js" }
// split -> { PDFDocument from "pdf-lib" }
// compress -> { qpdf }
// rotate -> { PDFDocument, degrees from "pdf-lib" }
// page-numbers -> { PDFDocument, StandardFonts, rgb from "pdf-lib" }
// watermark -> { PDFDocument, rgb, StandardFonts, degrees from "pdf-lib" }
// esign -> { PDFDocument from "pdf-lib" }
// unlock -> { qpdf }
// protect -> { qpdf }