import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalSlowDown } from "./middlewares/rateLimit.middleware.js";
import requestIp from "request-ip";
import passport from "passport";
import helmet from "helmet";

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
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

import logger from './utils/logger.js';
import "./middlewares/passport.js";
app.use(passport.initialize());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    logger.http(`${method} ${originalUrl}`, {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
});


import userRouter from "./routes/user.route.js";
import pdfToolsRouter from "./routes/pdfTools.route.js";
import downloadRouter from "./routes/download.route.js";
import uploadRouter from "./routes/upload.route.js";
import healthRouter from "./routes/health.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { uploadLimitMiddleware } from "./middlewares/uploadLimit.middleware.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/pdf-tools", uploadLimitMiddleware, pdfToolsRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/download", downloadRouter);
app.use("/api/v1/health", healthRouter);

app.use(errorHandler);

export { app };
