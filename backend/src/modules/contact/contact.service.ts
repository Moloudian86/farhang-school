import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { buildMeta, skipTake } from "../../utils/pagination";

export async function create(data: Prisma.ContactMessageCreateInput) {
  const row = await prisma.contactMessage.create({ data });
  return { id: row.id, createdAt: row.createdAt };
}

export async function adminList(q: { page: number; limit: number; isRead?: "true" | "false" }) {
  const where: Prisma.ContactMessageWhereInput = q.isRead ? { isRead: q.isRead === "true" } : {};
  const [items, total, unread] = await prisma.$transaction([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, ...skipTake(q) }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);
  return { items, meta: buildMeta(q.page, q.limit, total), unread };
}

export const markRead = (id: number, isRead: boolean) => prisma.contactMessage.update({ where: { id }, data: { isRead } });
