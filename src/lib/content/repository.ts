import type { CategorySlug } from "@/lib/site";
import { prisma } from "@/lib/db";
import {
  articles as seedArticles,
  authors as seedAuthors,
  factChecks as seedFactChecks,
  marketSnapshot as seedMarket,
  regions as seedRegions,
  topics as seedTopics,
} from "./seed";
import {
  mapArticle,
  mapAuthor,
  mapFactCheck,
  mapRegion,
  mapTopic,
} from "./mappers";
import type { Article, FactCheck, MarketSnapshot } from "./types";

export type SortMode = "latest" | "popular";

export interface ArticleQuery {
  category?: CategorySlug;
  topicSlug?: string;
  regionSlug?: string;
  sort?: SortMode;
  limit?: number;
  offset?: number;
  q?: string;
}

async function useDb(): Promise<boolean> {
  try {
    const count = await prisma.article.count();
    return count > 0;
  } catch {
    return false;
  }
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
  const { limit = 50, offset = 0, sort = "latest", ...filters } = query;

  if (!(await useDb())) {
    return filterSeed({ ...filters, sort }).slice(offset, offset + limit);
  }

  const where: Record<string, unknown> = {};
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

export async function getArticleBySlug(
  category: CategorySlug,
  slug: string,
): Promise<Article | undefined> {
  if (!(await useDb())) {
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
  if (!(await useDb())) {
    return seedArticles.find((a) => a.slug === slug);
  }

  const row = await prisma.article.findFirst({
    where: { slug },
    include: { topics: true, author: true },
  });
  return row ? mapArticle(row) : undefined;
}

export async function getHeroLead(): Promise<Article | undefined> {
  const items = await getArticles({ sort: "latest", limit: 20 });
  return items.find((a) => a.featuredLevel === 3) ?? items[0];
}

export async function getBreakingArticle(): Promise<Article | undefined> {
  if (!(await useDb())) {
    return seedArticles.find((a) => a.isBreaking);
  }

  const row = await prisma.article.findFirst({
    where: { isBreaking: true },
    include: { topics: true, author: true },
    orderBy: { publishedAt: "desc" },
  });
  return row ? mapArticle(row) : undefined;
}

export async function getPopularArticles(
  _hours: 6 | 24 | 168 = 24,
): Promise<Article[]> {
  return getArticles({ sort: "popular", limit: 5 });
}

export async function getEditorPicks(): Promise<Article[]> {
  if (!(await useDb())) {
    return sortSeed(
      seedArticles.filter((a) => a.featuredLevel >= 1),
      "latest",
    ).slice(0, 6);
  }

  const rows = await prisma.article.findMany({
    where: { featuredLevel: { gte: 1 } },
    include: { topics: true, author: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });
  return rows.map(mapArticle);
}

export async function getRelatedArticles(
  article: Article,
  limit = 4,
): Promise<Article[]> {
  const pool = await getArticles({ limit: 100 });
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
  if (!(await useDb())) return seedAuthors.find((a) => a.id === id);
  const row = await prisma.author.findUnique({ where: { id } });
  return row ? mapAuthor(row) : undefined;
}

export async function getAuthors() {
  if (!(await useDb())) return seedAuthors;
  const rows = await prisma.author.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapAuthor);
}

export async function getRegions() {
  if (!(await useDb())) return seedRegions;
  const rows = await prisma.region.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapRegion);
}

export async function getRegion(slug: string) {
  if (!(await useDb())) return seedRegions.find((r) => r.slug === slug);
  const row = await prisma.region.findUnique({ where: { slug } });
  return row ? mapRegion(row) : undefined;
}

export async function getTopics() {
  if (!(await useDb())) return seedTopics;
  const rows = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapTopic);
}

export async function getTopic(slug: string) {
  if (!(await useDb())) return seedTopics.find((t) => t.slug === slug);
  const row = await prisma.topic.findUnique({ where: { slug } });
  return row ? mapTopic(row) : undefined;
}

export async function getFactChecks(): Promise<FactCheck[]> {
  if (!(await useDb())) {
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
  if (!(await useDb())) return seedFactChecks.find((f) => f.slug === slug);
  const row = await prisma.factCheck.findUnique({ where: { slug } });
  return row ? mapFactCheck(row) : undefined;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  return seedMarket;
}

export async function getAllArticlePaths(): Promise<
  { category: CategorySlug; slug: string }[]
> {
  if (!(await useDb())) {
    return seedArticles.map((a) => ({
      category: a.category,
      slug: a.slug,
    }));
  }

  const rows = await prisma.article.findMany({
    select: { category: true, slug: true },
  });
  return rows.map((r) => ({
    category: r.category as CategorySlug,
    slug: r.slug,
  }));
}

export async function incrementArticleViews(articleId: string) {
  if (!(await useDb())) return;
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
  return rows.map((r) => mapArticle(r.article));
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
      getArticles({ category: cat as CategorySlug, limit: 3 }),
    ),
  );
  const merged = batches.flat();
  const seen = new Set<string>();
  const unique: Article[] = [];
  for (const a of merged) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    unique.push(a);
    if (unique.length >= limit) break;
  }
  return unique.length ? unique : getArticles({ limit });
}
