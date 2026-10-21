import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildMeta, skipTake } from "../../utils/pagination";

const include = { category: { select: { id: true, name: true, slug: true } } };

/** Today at 00:00 (the event_date column stores only a date, no time). */
function startOfToday() {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}

export async function list(q: { page: number; limit: number; upcoming?: "true" | "false"; category?: string }) {
  const upcoming = q.upcoming === "true";
  const where: Prisma.EventWhereInput = {
    ...(upcoming ? { eventDate: { gte: startOfToday() } } : {}),
    ...(q.category ? { category: { slug: q.category } } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      include,
      orderBy: [{ eventDate: upcoming ? "asc" : "desc" }, { startTime: "asc" }],
      ...skipTake(q),
    }),
    prisma.event.count({ where }),
  ]);
  return { items, meta: buildMeta(q.page, q.limit, total) };
}

export async function getById(id: number) {
  const event = await prisma.event.findUnique({ where: { id }, include });
  if (!event) throw ApiError.notFound("رویداد پیدا نشد");
  return event;
}

export function listCategories() {
  return prisma.eventCategory.findMany({ orderBy: { id: "asc" } });
}

export const create = (data: Prisma.EventUncheckedCreateInput) => prisma.event.create({ data });
export const update = (id: number, data: Prisma.EventUncheckedUpdateInput) => prisma.event.update({ where: { id }, data });
export async function remove(id: number) {
  await prisma.event.delete({ where: { id } });
}
