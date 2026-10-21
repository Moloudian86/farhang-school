import { EnrollmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildMeta, skipTake } from "../../utils/pagination";

export async function create(data: Prisma.EnrollmentUncheckedCreateInput) {
  try {
    const row = await prisma.enrollment.create({ data });
    // The visitor only gets a tiny receipt back, never the stored personal data.
    return { id: row.id, status: row.status, createdAt: row.createdAt };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw ApiError.conflict("برای این کد ملی قبلاً درخواست ثبت‌نام ثبت شده است");
    }
    throw err;
  }
}

export async function adminList(q: { page: number; limit: number; status?: EnrollmentStatus; search?: string }) {
  const where: Prisma.EnrollmentWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.search
      ? {
          OR: [
            { firstName: { contains: q.search } },
            { lastName: { contains: q.search } },
            { nationalCode: { contains: q.search } },
          ],
        }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.enrollment.findMany({ where, orderBy: { createdAt: "desc" }, ...skipTake(q) }),
    prisma.enrollment.count({ where }),
  ]);
  return { items, meta: buildMeta(q.page, q.limit, total) };
}

export async function adminGet(id: number) {
  const row = await prisma.enrollment.findUnique({ where: { id } });
  if (!row) throw ApiError.notFound("درخواست ثبت‌نام پیدا نشد");
  return row;
}

export const updateStatus = (id: number, status: EnrollmentStatus, adminNote?: string | null) =>
  prisma.enrollment.update({ where: { id }, data: { status, adminNote } });
