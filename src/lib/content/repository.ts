import type { ArticleStatus } from "@prisma/client";
import type { CategorySlug } from "@/lib/site";
import { prisma } from "@/lib/db";
import {
  articles as seedArticles,
  authors as seedAuthors,
  factChecks as seedFactChecks,
  regions as seedRegions,
} from "./seed";
export {
  getHomepageTopics,
  getTopic,
  getTopics,
} from "@/lib/topics/service";
import {
  mapArticle,
  mapAuthor,
  mapFactCheck,
  mapRegion,
} from "./mappers";
import type { Article, FactCheck, MarketSnapshot } from "./types";

export type SortMode = "latest" | "popular";

export interface ArticleQuery {
  category?: CategorySlug;
  topicSlug?: string;
  regionSlug?: string;
  locale?: "id" | "en";
  sort?: SortMode;
  limit?: number;
  offset?: number;
  q?: string;
  includeUnpublished?: boolean;
  /** Omit these article ids (homepage dedup, etc.). */
  excludeIds?: string[];
}

const PUBLISHED_STATUSES: ArticleStatus[] = ["PUBLISHED", "CORRECTED"];

function isPublishedSeed(a: Article): boolean {
  return new Date(a.publishedAt).getTime() <= Date.now();
}

async function hasDbArticles(): Promise<boolean> {
  try {
    const count = await prisma.article.count();
    return count > 0;
  } catch {
    return false;
  }
}

function publishedWhere(includeUnpublished?: boolean) {
  if (includeUnpublished) return {};
  const now = new Date();
  return {
    status: { in: PUBLISHED_STATUSES },
    publishedAt: { lte: now },
    OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
  };
}

function isRowPubliclyVisible(row: {
  status: ArticleStatus;
  publishedAt: Date;
  scheduledAt: Date | null;
}): boolean {
  if (!PUBLISHED_STATUSES.includes(row.status)) return false;
  const now = Date.now();
  if (row.publishedAt.getTime() > now) return false;
  if (row.scheduledAt && row.scheduledAt.getTime() > now) return false;
  return true;
}

function sortSeed(items: Article[], sort: SortMode): Article[] {
  const copy = [...items];
  if (sort === "popular") copy.sort((a, b) => b.viewCount - a.viewCount);
  else
    copy.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  return copy;
}

function filterSeed(query: Omit<ArticleQuery, "limit" | "offset">): Article[] {
  let result = [...seedArticles];
  if (query.excludeIds?.length) {
    const skip = new Set(query.excludeIds);
    result = result.filter((a) => !skip.has(a.id));
  }
  if (!query.includeUnpublished) {
    result = result.filter(isPublishedSeed);
  }
  if (query.locale) result = result.filter((a) => a.locale === query.locale);
  if (query.category) result = result.filter((a) => a.category === query.category);
  if (query.topicSlug)
    result = result.filter((a) => a.topicSlugs.includes(query.topicSlug!));
  if (query.regionSlug)
    result = result.filter((a) => a.regionSlug === query.regionSlug);
  if (query.q?.trim()) {
    const q = query.q.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.dek.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q),
    );
  }
  return sortSeed(result, query.sort ?? "latest");
}

export async function getArticles(
  query: ArticleQuery = {},
): Promise<Article[]> {
  const {
    limit = 50,
    offset = 0,
    sort = "latest",
    excludeIds,
    ...filters
  } = query;

  if (!(await hasDbArticles())) {
    return filterSeed({ ...filters, sort, excludeIds }).slice(
      offset,
      offset + limit,
    );
  }

  const where: Record<string, unknown> = {
    ...publishedWhere(filters.includeUnpublished),
  };
  if (excludeIds?.length) {
    where.id = { notIn: excludeIds };
  }
  if (filters.locale) where.locale = filters.locale;
  if (filters.category) where.category = filters.category;
  if (filters.regionSlug) where.regionSlug = filters.regionSlug;
  if (filters.topicSlug) {
    where.topics = { some: { topicSlug: filters.topicSlug } };
  }
  if (filters.q?.trim()) {
    where.OR = [
      { title: { contains: filters.q } },
      { dek: { contains: filters.q } },
      { body: { contains: filters.q } },
    ];
  }

  const rows = await prisma.article.findMany({
    where,
    include: { topics: true, author: true },
    orderBy:
      sort === "popular"
        ? { viewCount: "desc" }
        : { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });

  return rows.map(mapArticle);
}

export async function countArticles(
  query: Omit<ArticleQuery, "limit" | "offset" | "sort"> = {},
): Promise<number> {
  if (!(await hasDbArticles())) {
    return filterSeed(query).length;
  }

  const where: Record<string, unknown> = {
    ...publishedWhere(query.includeUnpublished),
  };
  if (query.locale) where.locale = query.locale;
  if (query.category) where.category = query.category;
  if (query.regionSlug) where.regionSlug = query.regionSlug;
  if (query.topicSlug) {
    where.topics = { some: { topicSlug: query.topicSlug } };
  }
  if (query.q?.trim()) {
    where.OR = [
      { title: { contains: query.q } },
      { dek: { contains: query.q } },
      { body: { contains: query.q } },
    ];
  }

  return prisma.article.count({ where });
}

export async function getArticleBySlug(
  category: CategorySlug,
  slug: string,
): Promise<Article | undefined> {
  if (!(await hasDbArticles())) {
    const a = seedArticles.find((a) => a.category === category && a.slug === slug);
    return a && isPublishedSeed(a) ? a : undefined;
  }

  const row = await prisma.article.findUnique({
    where: { category_slug: { category, slug } },
    include: { topics: true, author: true },
  });
  if (!row || !isRowPubliclyVisible(row)) return undefined;
  return mapArticle(row);
}

/** Staff-only: load article regardless of publish status (for admin preview). */
export async function getArticleBySlugStaffPreview(
  category: CategorySlug,
  slug: string,
): Promise<Article | undefined> {
  if (!(await hasDbArticles())) {
    return seedArticles.find((a) => a.category === category && a.slug === slug);
  }

  const row = await prisma.article.findUnique({
    where: { category_slug: { category, slug } },
    include: { topics: true, author: true },
  });
  return row ? mapArticle(row) : undefined;
}

export async function getArticleBySlugOnly(
  slug: string,
): Promise<Article | undefined> {
  if (!(await hasDbArticles())) {
    return seedArticles.find((a) => a.slug === slug && isPublishedSeed(a));
  }

  const row = await prisma.article.findFirst({
    where: { slug, ...publishedWhere() },
    include: { topics: true, author: true },
  });
  return row ? mapArticle(row) : undefined;
}

const HERO_FEATURED_MAX_AGE_MS = 72 * 60 * 60 * 1000;

export async function getHeroLead(
  locale: "id" | "en" = "id",
  excludeIds: string[] = [],
): Promise<Article | undefined> {
  const items = await getArticles({
    sort: "latest",
    limit: 30,
    locale,
    excludeIds,
  });
  const now = Date.now();
  const pinnedHero = items.find(
    (a) =>
      a.featuredLevel === 3 &&
      now - new Date(a.publishedAt).getTime() <= HERO_FEATURED_MAX_AGE_MS,
  );
  return pinnedHero ?? items[0];
}

export type UrgentBannerKind = "breaking" | "developing";

export type UrgentBanner = {
  kind: UrgentBannerKind;
  article: Article;
};

function seedUrgentActive(a: Article): boolean {
  if (!isPublishedSeed(a)) return false;
  if (a.isBreaking) {
    if (a.breakingExpiresAt && new Date(a.breakingExpiresAt).getTime() <= Date.now()) {
      return false;
    }
    return true;
  }
  return a.isDeveloping;
}

export async function getUrgentBanner(
  locale: "id" | "en" = "id",
): Promise<UrgentBanner | undefined> {
  if (!(await hasDbArticles())) {
    const candidates = seedArticles.filter(
      (a) =>
        seedUrgentActive(a) &&
        (a.locale === locale || locale === "id"),
    );
    const breaking = candidates.find((a) => a.isBreaking);
    if (breaking) return { kind: "breaking", article: breaking };
    const developing = candidates.find((a) => a.isDeveloping);
    if (developing) return { kind: "developing", article: developing };
    return undefined;
  }

  const { expireStaleBreakingFlags } = await import("@/lib/content/urgency");
  await expireStaleBreakingFlags();

  const published = publishedWhere();
  const now = new Date();

  const breakingRow = await prisma.article.findFirst({
    where: {
      locale,
      isBreaking: true,
      ...published,
      OR: [{ breakingExpiresAt: null }, { breakingExpiresAt: { gt: now } }],
    },
    include: { topics: true, author: true },
    orderBy: { publishedAt: "desc" },
  });
  if (breakingRow) {
    return { kind: "breaking", article: mapArticle(breakingRow) };
  }

  const developingRow = await prisma.article.findFirst({
    where: { locale, isDeveloping: true, ...published },
    include: { topics: true, author: true },
    orderBy: { publishedAt: "desc" },
  });
  if (developingRow) {
    return { kind: "developing", article: mapArticle(developingRow) };
  }

  return undefined;
}

/** @deprecated Use getUrgentBanner */
export async function getBreakingArticle(
  locale: "id" | "en" = "id",
): Promise<Article | undefined> {
  const banner = await getUrgentBanner(locale);
  return banner?.article;
}

export async function getPopularArticles(
  _hours: 6 | 24 | 168 = 24,
  locale: "id" | "en" = "id",
): Promise<Article[]> {
  return getArticles({ sort: "popular", limit: 5, locale });
}

export async function getEditorPicks(
  locale: "id" | "en" = "id",
): Promise<Article[]> {
  if (!(await hasDbArticles())) {
    return sortSeed(
      seedArticles.filter(
        (a) =>
          a.featuredLevel >= 1 &&
          isPublishedSeed(a) &&
          a.locale === locale,
      ),
      "latest",
    ).slice(0, 6);
  }

  const rows = await prisma.article.findMany({
    where: { featuredLevel: { gte: 1 }, locale, ...publishedWhere() },
    include: { topics: true, author: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });
  return rows.map(mapArticle);
}

export async function getMultimediaArticles(limit = 12): Promise<Article[]> {
  const items = await getArticles({ category: "multimedia", limit: 50 });
  const withMedia = items.filter(
    (a) => a.videoUrl || a.galleryImages.length > 0,
  );
  return (withMedia.length ? withMedia : items).slice(0, limit);
}

export async function getEnglishArticles(limit = 12): Promise<Article[]> {
  return getArticles({ locale: "en", limit });
}

export async function getRelatedArticles(
  article: Article,
  limit = 4,
): Promise<Article[]> {
  const pool = await getArticles({ limit: 100, locale: article.locale });
  const byTopic = pool.filter(
    (a) =>
      a.id !== article.id &&
      a.topicSlugs.some((t) => article.topicSlugs.includes(t)),
  );
  const byCategory = pool.filter(
    (a) => a.id !== article.id && a.category === article.category,
  );
  const merged = [...byTopic, ...byCategory];
  const seen = new Set<string>();
  const unique: Article[] = [];
  for (const item of merged) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
    if (unique.length >= limit) break;
  }
  return unique;
}

export async function getAuthor(id: string) {
  if (!(await hasDbArticles())) return seedAuthors.find((a) => a.id === id);
  const row = await prisma.author.findUnique({ where: { id } });
  return row ? mapAuthor(row) : undefined;
}

export async function getAuthors() {
  if (!(await hasDbArticles())) return seedAuthors;
  const rows = await prisma.author.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapAuthor);
}

export async function getRegions() {
  if (!(await hasDbArticles())) return seedRegions;
  const rows = await prisma.region.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapRegion);
}

export async function getRegion(slug: string) {
  if (!(await hasDbArticles())) return seedRegions.find((r) => r.slug === slug);
  const row = await prisma.region.findUnique({ where: { slug } });
  return row ? mapRegion(row) : undefined;
}

export async function getFactChecks(): Promise<FactCheck[]> {
  if (!(await hasDbArticles())) {
    return [...seedFactChecks].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }

  const rows = await prisma.factCheck.findMany({
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(mapFactCheck);
}

export async function getFactCheck(slug: string) {
  if (!(await hasDbArticles())) return seedFactChecks.find((f) => f.slug === slug);
  const row = await prisma.factCheck.findUnique({ where: { slug } });
  return row ? mapFactCheck(row) : undefined;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot | null> {
  const { getLiveMarketSnapshot } = await import("@/lib/market-live");
  return getLiveMarketSnapshot();
}

export async function getAllArticlePaths(): Promise<
  { category: CategorySlug; slug: string }[]
> {
  const rows = await getPublishedArticlesForSitemap();
  return rows.map(({ category, slug }) => ({ category, slug }));
}

export async function getPublishedArticlesForSitemap(): Promise<
  {
    category: CategorySlug;
    slug: string;
    publishedAt: Date;
    title: string;
  }[]
> {
  if (!(await hasDbArticles())) {
    return seedArticles.filter(isPublishedSeed).map((a) => ({
      category: a.category,
      slug: a.slug,
      publishedAt: new Date(a.publishedAt),
      title: a.title,
    }));
  }

  const rows = await prisma.article.findMany({
    where: publishedWhere(),
    select: {
      category: true,
      slug: true,
      publishedAt: true,
      title: true,
    },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map((r) => ({
    category: r.category as CategorySlug,
    slug: r.slug,
    publishedAt: r.publishedAt,
    title: r.title,
  }));
}

/** Google News sitemap: articles from the last 48 hours (max 1000). */
export async function getRecentNewsSitemapArticles(): Promise<
  {
    category: CategorySlug;
    slug: string;
    publishedAt: Date;
    title: string;
  }[]
> {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const all = await getPublishedArticlesForSitemap();
  return all
    .filter((a) => a.publishedAt >= cutoff)
    .slice(0, 1000);
}

export async function incrementArticleViews(articleId: string) {
  if (!(await hasDbArticles())) return;
  await prisma.article.update({
    where: { id: articleId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function getSavedArticleIds(userId: string): Promise<string[]> {
  const rows = await prisma.savedArticle.findMany({
    where: { userId },
    select: { articleId: true },
  });
  return rows.map((r) => r.articleId);
}

export async function getSavedArticles(userId: string): Promise<Article[]> {
  const rows = await prisma.savedArticle.findMany({
    where: { userId },
    include: {
      article: { include: { topics: true, author: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows
    .filter((r) => isRowPubliclyVisible(r.article))
    .map((r) => mapArticle(r.article));
}

export async function getReadingHistory(
  userId: string,
  limit = 10,
): Promise<Article[]> {
  if (!(await hasDbArticles())) return [];
  const rows = await prisma.readingHistory.findMany({
    where: { userId },
    include: {
      article: { include: { topics: true, author: true } },
    },
    orderBy: { viewedAt: "desc" },
    take: limit,
  });
  return rows
    .filter((r) => isRowPubliclyVisible(r.article))
    .map((r) => mapArticle(r.article));
}

export async function recordReadingHistory(userId: string, articleId: string) {
  await prisma.readingHistory.upsert({
    where: { userId_articleId: { userId, articleId } },
    create: { userId, articleId },
    update: { viewedAt: new Date() },
  });
}

export interface CommentView {
  id: string;
  body: string;
  createdAt: string;
  userName: string;
}

export async function getComments(articleId: string): Promise<CommentView[]> {
  if (!(await hasDbArticles())) return [];
  const rows = await prisma.comment.findMany({
    where: { articleId, approved: true },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    userName: r.user.name ?? r.user.email.split("@")[0] ?? "Pembaca",
  }));
}

export async function addComment(
  userId: string,
  articleId: string,
  body: string,
) {
  const trimmed = body.trim();
  if (trimmed.length < 3 || trimmed.length > 2000) {
    throw new Error("Komentar tidak valid");
  }
  return prisma.comment.create({
    data: { userId, articleId, body: trimmed, approved: true },
  });
}

export async function subscribeNewsletter(email: string, topics: string[] = []) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Email tidak valid");
  }
  return prisma.newsletterSubscriber.upsert({
    where: { email: normalized },
    create: {
      email: normalized,
      topics: JSON.stringify(topics),
    },
    update: { topics: JSON.stringify(topics) },
  });
}

export async function getRecommendationsForUser(
  userId: string,
  limit = 6,
): Promise<Article[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return getArticles({ limit });

  let interests: string[] = [];
  try {
    interests = JSON.parse(user.interests) as string[];
  } catch {
    interests = [];
  }

  if (interests.length === 0 && user.regionSlug) {
    return getArticles({ regionSlug: user.regionSlug, limit });
  }

  const batches = await Promise.all(
    interests.slice(0, 3).map((cat) =>
      getArticles({ category: cat as CategorySlug, limit: 8 }),
    ),
  );
  const merged = batches.flat();
  const seen = new Set<string>();
  const unique: Article[] = [];
  for (const a of merged) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    unique.push(a);
  }
  unique.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  if (unique.length >= limit) {
    return unique.slice(0, limit);
  }
  const latest = await getArticles({ limit: limit * 2 });
  for (const a of latest) {
    if (seen.has(a.id)) continue;
    unique.push(a);
    if (unique.length >= limit) break;
  }
  return unique.length ? unique.slice(0, limit) : getArticles({ limit });
}

export async function getAdminArticles(limit = 30) {
  if (!(await hasDbArticles())) {
    return filterSeed({ includeUnpublished: true, sort: "latest" }).slice(
      0,
      limit,
    );
  }
  const rows = await prisma.article.findMany({
    include: { topics: true, author: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(mapArticle);
}

export async function updateArticleStatus(
  articleId: string,
  status: ArticleStatus,
) {
  const clearUrgency = !["PUBLISHED", "CORRECTED"].includes(status);
  return prisma.article.update({
    where: { id: articleId },
    data: {
      status,
      ...(clearUrgency
        ? {
            isBreaking: false,
            isDeveloping: false,
            breakingExpiresAt: null,
          }
        : {}),
    },
  });
}
