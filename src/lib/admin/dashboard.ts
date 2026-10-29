import type { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ARTICLE_STATUSES } from "./constants";

export type AdminDashboardStats = {
  totalArticles: number;
  totalViews: number;
  commentCount: number;
  subscriberCount: number;
  byStatus: Record<ArticleStatus, number>;
  topByViews: {
    id: string;
    title: string;
    category: string;
    slug: string;
    viewCount: number;
    status: ArticleStatus;
  }[];
  recentArticles: {
    id: string;
    title: string;
    category: string;
    slug: string;
    status: ArticleStatus;
    publishedAt: Date;
    viewCount: number;
  }[];
  inReviewCount: number;
  draftCount: number;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [grouped, aggregate, commentCount, subscriberCount, topByViews, recentArticles] =
    await Promise.all([
      prisma.article.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.article.aggregate({
        _sum: { viewCount: true },
        _count: { _all: true },
      }),
      prisma.comment.count(),
      prisma.newsletterSubscriber.count(),
      prisma.article.findMany({
        orderBy: { viewCount: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          slug: true,
          viewCount: true,
          status: true,
        },
      }),
      prisma.article.findMany({
        orderBy: { publishedAt: "desc" },
        take: 8,
        select: {
          id: true,
          title: true,
          category: true,
          slug: true,
          status: true,
          publishedAt: true,
          viewCount: true,
        },
      }),
    ]);

  const byStatus = Object.fromEntries(
    ARTICLE_STATUSES.map((s) => [s, 0]),
  ) as Record<ArticleStatus, number>;

  for (const row of grouped) {
    byStatus[row.status] = row._count._all;
  }

  return {
    totalArticles: aggregate._count._all,
    totalViews: aggregate._sum.viewCount ?? 0,
    commentCount,
    subscriberCount,
    byStatus,
    topByViews,
    recentArticles,
    inReviewCount: byStatus.REVIEW + byStatus.SCHEDULED,
    draftCount: byStatus.DRAFT,
  };
}

export type ArticleListFilters = {
  q?: string;
  status?: ArticleStatus;
  category?: string;
  page?: number;
  pageSize?: number;
};

export async function listAdminArticles(filters: ArticleListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, filters.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where: {
    title?: { contains: string };
    status?: ArticleStatus;
    category?: string;
  } = {};

  const q = filters.q?.trim();
  if (q) {
    where.title = { contains: q };
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.category) {
    where.category = filters.category;
  }

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        category: true,
        slug: true,
        viewCount: true,
        status: true,
        locale: true,
        publishedAt: true,
        isBreaking: true,
        isDeveloping: true,
        breakingExpiresAt: true,
      },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
