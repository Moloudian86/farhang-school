import { NewsStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildMeta, skipTake } from "../../utils/pagination";

const categorySelect = { select: { id: true, name: true, slug: true } };

// List cards do not need the long "content" text.
const listSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  imageUrl: true,
  author: true,
  publishedAt: true,
  category: categorySelect,
} satisfies Prisma.NewsSelect;

/** The public site may only ever see published news whose date has arrived. */
const publicFilter = (): Prisma.NewsWhereInput => ({
  status: NewsStatus.PUBLISHED,
  publishedAt: { lte: new Date() },
});

const searchFilter = (search?: string): Prisma.NewsWhereInput =>
  search ? { OR: [{ title: { contains: search } }, { summary: { contains: search } }] } : {};

export async function listPublished(q: { page: number; limit: number; category?: string; search?: string }) {
  const where: Prisma.NewsWhereInput = {
    ...publicFilter(),
    ...searchFilter(q.search),
    ...(q.category ? { category: { slug: q.category } } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.news.findMany({ where, select: listSelect, orderBy: { publishedAt: "desc" }, ...skipTake(q) }),
    prisma.news.count({ where }),
  ]);
  return { items, meta: buildMeta(q.page, q.limit, total) };
}

export async function getPublishedBySlug(slug: string) {
  const news = await prisma.news.findFirst({
    where: { slug, ...publicFilter() },
    select: { ...listSelect, content: true },
  });
  if (!news) throw ApiError.notFound("خبر پیدا نشد");
  return news;
}

export function listCategories() {
  return prisma.newsCategory.findMany({ orderBy: { id: "asc" } });
}

// ----------------------------- admin -----------------------------

export async function adminList(q: { page: number; limit: number; status?: NewsStatus; search?: string }) {
  const where: Prisma.NewsWhereInput = { ...searchFilter(q.search), ...(q.status ? { status: q.status } : {}) };
  const [items, total] = await prisma.$transaction([
    prisma.news.findMany({
      where,
      select: { ...listSelect, status: true, categoryId: true },
      orderBy: { createdAt: "desc" },
      ...skipTake(q),
    }),
    prisma.news.count({ where }),
  ]);
  return { items, meta: buildMeta(q.page, q.limit, total) };
}

export function create(input: Prisma.NewsUncheckedCreateInput) {
  const data = { ...input, slug: input.slug ?? `news-${Date.now()}` };
  if (data.status === NewsStatus.PUBLISHED && !data.publishedAt) data.publishedAt = new Date();
  return prisma.news.create({ data });
}

export async function update(id: number, input: Prisma.NewsUncheckedUpdateInput) {
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("خبر پیدا نشد");
  const data = { ...input };
  // First time it becomes PUBLISHED -> stamp the publish date automatically.
  if (data.status === NewsStatus.PUBLISHED && !existing.publishedAt && data.publishedAt === undefined) {
    data.publishedAt = new Date();
  }
  return prisma.news.update({ where: { id }, data });
}

export async function remove(id: number) {
  await prisma.news.delete({ where: { id } }); // P2025 -> 404 handled centrally
}
