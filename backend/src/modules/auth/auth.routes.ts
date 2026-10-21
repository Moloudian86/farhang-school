import { CookieOptions, Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";
import { authenticate, AUTH_COOKIE } from "../../middlewares/auth";
import { loginLimiter } from "../../middlewares/rateLimit";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { loginSchema } from "./auth.schema";
import * as service from "./auth.service";

export const authRouter = Router();

// The token lives in an httpOnly cookie: JavaScript in the browser can't read it (safer against XSS).
const cookieBase: CookieOptions = { httpOnly: true, sameSite: "lax", secure: env.isProd, path: "/" };

authRouter.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const { token, user } = await service.login(email, password);
    const exp = (jwt.decode(token) as JwtPayload).exp as number;
    res.cookie(AUTH_COOKIE, token, { ...cookieBase, maxAge: exp * 1000 - Date.now() });
    sendSuccess(res, { user }, { message: "با موفقیت وارد شدید" });
  })
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE, cookieBase);
  sendSuccess(res, null, { message: "از حساب خود خارج شدید" });
});

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    sendSuccess(res, { user: await service.getMe(req.user!.id) });
  })
);
