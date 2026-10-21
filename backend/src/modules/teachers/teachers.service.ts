import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

// The public site never sees user ids or hidden (inactive) teachers.
const publicSelect = {
  id: true,
  firstName: true,
  lastName: true,
  position: true,
  subject: true,
  degree: true,
  experienceYears: true,
  bio: true,
  imageUrl: true,
} satisfies Prisma.TeacherSelect;

export const listPublic = () =>
  prisma.teacher.findMany({ where: { isActive: true }, select: publicSelect, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });

export const listAll = () => prisma.teacher.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
export const create = (data: Prisma.TeacherUncheckedCreateInput) => prisma.teacher.create({ data });
export const update = (id: number, data: Prisma.TeacherUncheckedUpdateInput) => prisma.teacher.update({ where: { id }, data });
export async function remove(id: number) {
  await prisma.teacher.delete({ where: { id } });
}
