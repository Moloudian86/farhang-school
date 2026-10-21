import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { buildMeta, skipTake } from "../../utils/pagination";

export async function list(q: { page: number; limit: number; category?: string }) {
  const where: Prisma.GalleryImageWhereInput = q.category ? { category: { slug: q.category } } : {};
  const [items, total] = await prisma.$transaction([
    prisma.galleryImage.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ sortOrder: "asc" }, { takenAt: "desc" }, { id: "desc" }],
      ...skipTake(q),
    }),
    prisma.galleryImage.count({ where }),
  ]);
  return { items, meta: buildMeta(q.page, q.limit, total) };
}

export const listCategories = () => prisma.galleryCategory.findMany({ orderBy: { id: "asc" } });
export const create = (data: Prisma.GalleryImageUncheckedCreateInput) => prisma.galleryImage.create({ data });
export const update = (id: number, data: Prisma.GalleryImageUncheckedUpdateInput) =>
  prisma.galleryImage.update({ where: { id }, data });
export async function remove(id: number) {
  await prisma.galleryImage.delete({ where: { id } });
}
