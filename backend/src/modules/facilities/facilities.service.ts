import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export const listPublic = () =>
  prisma.facility.findMany({
    where: { isActive: true },
    select: { id: true, title: true, description: true, icon: true, imageUrl: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

export const listAll = () => prisma.facility.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
export const create = (data: Prisma.FacilityUncheckedCreateInput) => prisma.facility.create({ data });
export const update = (id: number, data: Prisma.FacilityUncheckedUpdateInput) => prisma.facility.update({ where: { id }, data });
export async function remove(id: number) {
  await prisma.facility.delete({ where: { id } });
}
