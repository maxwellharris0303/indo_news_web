import type { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const DEFAULT_BREAKING_HOURS = 6;
export const BREAKING_HOUR_OPTIONS = [3, 6, 12, 24] as const;

export type UrgencyMode = "none" | "breaking" | "developing";

const PUBLIC_STATUSES: ArticleStatus[] = ["PUBLISHED", "CORRECTED"];

export function breakingExpiresAtFromHours(hours: number): Date {
  const h = Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_BREAKING_HOURS;
  return new Date(Date.now() + h * 60 * 60 * 1000);
}

/** Clears breaking flags whose expiry has passed. */
export async function expireStaleBreakingFlags(): Promise<number> {
  const now = new Date();
  const result = await prisma.article.updateMany({
    where: {
      isBreaking: true,
      breakingExpiresAt: { lte: now },
    },
    data: {
      isBreaking: false,
      breakingExpiresAt: null,
    },
  });
  return result.count;
}

export async function applyArticleUrgency(
  articleId: string,
  mode: UrgencyMode,
  breakingHours = DEFAULT_BREAKING_HOURS,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, locale: true },
  });
  if (!article) {
    return { ok: false, error: "Artikel tidak ditemukan" };
  }

  await expireStaleBreakingFlags();

  if (mode !== "none") {
    await prisma.article.updateMany({
      where: {
        locale: article.locale,
        id: { not: articleId },
        OR: [{ isBreaking: true }, { isDeveloping: true }],
      },
      data: {
        isBreaking: false,
        isDeveloping: false,
        breakingExpiresAt: null,
      },
    });
  }

  if (mode === "none") {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        isBreaking: false,
        isDeveloping: false,
        breakingExpiresAt: null,
      },
    });
    return { ok: true };
  }

  await prisma.article.update({
    where: { id: articleId },
    data: {
      isBreaking: mode === "breaking",
      isDeveloping: mode === "developing",
      breakingExpiresAt:
        mode === "breaking"
          ? breakingExpiresAtFromHours(breakingHours)
          : null,
    },
  });

  return { ok: true };
}

export function publishedStatusWhere() {
  return { status: { in: PUBLIC_STATUSES } };
}
