import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

// Used when the email does not exist, so a wrong email and a wrong password take the same time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export function toPublicUser(user: Pick<User, "id" | "email" | "role" | "firstName" | "lastName">) {
  return { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordOk || !user.isActive) {
    // Same message for every failure: never tell an attacker which part was wrong.
    throw ApiError.unauthorized("ایمیل یا رمز عبور اشتباه است");
  }

  const token = jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
  return { token, user: toPublicUser(user) };
}

export async function getMe(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !user.isActive) throw ApiError.unauthorized();
  return toPublicUser(user);
}
