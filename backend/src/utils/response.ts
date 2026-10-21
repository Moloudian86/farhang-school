import { Response } from "express";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Every successful answer has the same shape: { success, data, message, meta } */
export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { status?: number; message?: string; meta?: PageMeta } = {}
) {
  res.status(options.status ?? 200).json({
    success: true,
    data,
    message: options.message ?? null,
    meta: options.meta ?? null,
  });
}
