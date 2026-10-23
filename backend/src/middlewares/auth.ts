import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const AUTH_COOKIE = "farhang_token";

export interface AuthUser {
  id: number;
  phone: string | null; // students have no phone (they log in with their student code)
  role: Role;
  firstName: string;
  lastName: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Step 1: "Who are you?"  Reads the login token (cookie or Bearer header) and loads the user. */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = req.cookies?.[AUTH_COOKIE] ?? (header?.startsWith("Bearer ") ? header.slice(7) : undefined);
  if (!token) throw ApiError.unauthorized();

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    throw ApiError.unauthorized("نشست شما منقضی شده است. دوباره وارد شوید");
  }

  const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
  if (!user || !user.isActive) throw ApiError.unauthorized();

  req.user = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  next();
});

/** Step 2: "Are you allowed?"  Use after authenticate:  authorize(Role.ADMIN) */
export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };

/** Shortcut used by every admin route. */
export const adminOnly = [authenticate, authorize(Role.ADMIN)];

export const teacherOnly = [authenticate, authorize(Role.TEACHER)];
export const studentOnly = [authenticate, authorize(Role.STUDENT)];
export const parentOnly = [authenticate, authorize(Role.PARENT)];
