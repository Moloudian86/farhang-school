import { randomUUID } from "crypto";
import fs from "fs";
import { Router, Request, Response } from "express";
import multer from "multer";
import { env } from "../../config/env";
import { adminOnly } from "../../middlewares/auth";
import { ApiError } from "../../utils/ApiError";
import { sendSuccess } from "../../utils/response";

export const uploadsRouter = Router();

// Only these image types are accepted. The file name is random, so the visitor's own file name is never used.
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(env.uploadsDir, { recursive: true });
      cb(null, env.uploadsDir);
    },
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) cb(null, true);
    else cb(ApiError.badRequest("فقط تصاویر JPG، PNG یا WebP مجاز است"));
  },
});

// Admin only. The login check runs BEFORE multer, so strangers can never write files to the disk.
// Send a form-data request with a file field named "image". The answer contains the address to save in the database.
uploadsRouter.post(
  "/",
  adminOnly,
  upload.single("image"),
  (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest("فایلی ارسال نشد");

    sendSuccess(
      res,
      { url: `/uploads/${req.file.filename}` },
      { status: 201, message: "تصویر آپلود شد" }
    );
  }
);