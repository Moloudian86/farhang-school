import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma, Role, User } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { LoginIdentifier } from "../../utils/identifiers";

// Used when the account does not exist, so "unknown account" and "wrong password" take the same time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

const LOGIN_FAILED = "شمارهٔ موبایل / کد دانش‌آموزی یا رمز عبور اشتباه است";

// A student's code lives on the Student row; we load it together with the user.
const withStudent = { student: { select: { studentCode: true, isActive: true } } } satisfies Prisma.UserInclude;

type PublicUserSource = Pick<User, "id" | "phone" | "role" | "firstName" | "lastName"> & {
  student?: { studentCode: string } | null;
};

/** What the browser is allowed to know about the logged-in user (never the password hash). */
export function toPublicUser(user: PublicUserSource) {
  return {
    id: user.id,
    phone: user.phone,
    studentCode: user.student?.studentCode ?? null,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

/**
 * Finds the account for what the person typed, and checks that the ROLE fits the kind of login:
 *   mobile number -> ADMIN / TEACHER / PARENT only   (a student can never log in with a phone)
 *   student code  -> STUDENT only (and the student must still be active)
 * Returns null when nothing fits. The caller must NOT tell the person why.
 */
async function findLoginUser(identifier: LoginIdentifier) {
  if (identifier.kind === "PHONE") {
    const user = await prisma.user.findUnique({ where: { phone: identifier.phone }, include: withStudent });
    return user && user.role !== Role.STUDENT ? user : null;
  }

  const user = await prisma.user.findFirst({
    where: { role: Role.STUDENT, student: { is: { studentCode: identifier.code } } },
    include: withStudent,
  });
  return user && user.student?.isActive ? user : null;
}

export async function login(identifier: LoginIdentifier, password: string) {
  const user = await findLoginUser(identifier);
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordOk || !user.isActive) {
    // Same message for every failure: never tell an attacker which part was wrong.
    throw ApiError.unauthorized(LOGIN_FAILED);
  }

  const token = jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
  return { token, user: toPublicUser(user) };
}

export async function getMe(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, include: withStudent });
  if (!user || !user.isActive) throw ApiError.unauthorized();
  return toPublicUser(user);
}
