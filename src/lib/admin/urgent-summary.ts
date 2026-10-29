import type { ArticleStatus } from "@prisma/client";
import { expireStaleBreakingFlags } from "@/lib/content/urgency";
import { prisma } from "@/lib/db";

const PUBLISHED: ArticleStatus[] = ["PUBLISHED", "CORRECTED"];

export async function getAdminUrgentSummary(locale = "id") {
  await expireStaleBreakingFlags();
  const now = new Date();
  const published = { status: { in: PUBLISHED } };

  const breaking = await prisma.article.findFirst({
    where: {
      locale,
      isBreaking: true,
      ...published,
      OR: [{ breakingExpiresAt: null }, { breakingExpiresAt: { gt: now } }],
    },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      breakingExpiresAt: true,
      category: true,
      slug: true,
    },
  });

  const developing = await prisma.article.findFirst({
    where: { locale, isDeveloping: true, ...published },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, category: true, slug: true },
  });

  return { breaking, developing };
}
