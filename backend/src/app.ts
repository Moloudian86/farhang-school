import "./config/zod"; // Persian validation messages (must be loaded first)
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { apiLimiter } from "./middlewares/rateLimit";
import { apiRouter } from "./routes";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Uploaded images are served from here.
app.use("/uploads", express.static(env.uploadsDir));

app.use("/api", apiLimiter);

// Health checks
app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, message: "Farhang School API is running" });
});

app.get("/api/v1/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: "Database connection is OK" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

app.use("/api/v1", apiRouter);

// Must stay LAST: unknown URLs and every error end up here.
app.use(notFound);
app.use(errorHandler);

export default app;
