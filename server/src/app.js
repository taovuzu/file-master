import express from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";
import passport from "passport";
import { ApiError } from "./utils/ApiError.js";

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

app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000,
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

import "./middlewares/passport.js";
app.use(passport.initialize());

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
import { uploadLimitMiddleware } from "./middlewares/uploadLimit.middleware.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/pdf-tools", enforceUsageLimits, uploadLimitMiddleware, pdfToolsRouter);
app.use("/api/v1/download", downloadRouter);
app.use("/api/v1/health", healthRouter);

app.use(errorHandler);

export { app };

// image-to-pdf -> { PDFDocument from "pdf-lib" }
// doc-to-pdf -> { libreoffice }
// pdf-to-ppt -> { pptxgenjs, pdf-poppler, pdf-lib }
// merge -> { PDFMerger from "pdf-merger-js" }
// split -> { PDFDocument from "pdf-lib" }
// compress -> { ghostscript }
// rotate -> { PDFDocument, degrees from "pdf-lib" }
// page-numbers -> { PDFDocument, StandardFonts, rgb from "pdf-lib" }
// watermark -> { PDFDocument, rgb, StandardFonts, degrees from "pdf-lib" }
// esign -> { PDFDocument from "pdf-lib" }
// unlock -> { ghostscript }
// protect -> { ghostscript }