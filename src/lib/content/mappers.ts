import type {
  Article as PrismaArticle,
  Author as PrismaAuthor,
  FactCheck as PrismaFactCheck,
  Region as PrismaRegion,
  Topic as PrismaTopic,
} from "@prisma/client";
import type { CategorySlug } from "@/lib/site";
import type { Article, Author, FactCheck, GalleryImage, Region, Topic } from "./types";

type ArticleWithRelations = PrismaArticle & {
  topics?: { topicSlug: string }[];
  author?: PrismaAuthor;
};

export function mapAuthor(row: PrismaAuthor): Author {
  return {
    id: row.id,
    name: row.name,
    title: row.title ?? undefined,
    bio: row.bio ?? undefined,
  };
}

export function mapRegion(row: PrismaRegion): Region {
  return { slug: row.slug, name: row.name, province: row.province };
}

export function mapTopic(row: PrismaTopic): Topic {
  return { slug: row.slug, name: row.name, description: row.description };
}

function parseGallery(raw: string): GalleryImage[] {
  try {
    return JSON.parse(raw) as GalleryImage[];
  } catch {
    return [];
  }
}

export function mapArticle(row: ArticleWithRelations): Article {
  const topicSlugs = row.topics?.map((t) => t.topicSlug) ?? [];

  return {
    id: row.id,
    slug: row.slug,
    category: row.category as CategorySlug,
    locale: (row.locale === "en" ? "en" : "id") as "id" | "en",
    title: row.title,
    dek: row.dek,
    body: row.body,
    aiSummary: row.aiSummary ?? undefined,
    summaryBullets: JSON.parse(row.summaryBullets) as string[],
    publishedAt: row.publishedAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString(),
    correctionNote: row.correctionNote ?? undefined,
    authorId: row.authorId,
    authorName: row.author?.name,
    topicSlugs,
    regionSlug: row.regionSlug ?? undefined,
    imageUrl: row.imageUrl,
    imageCaption: row.imageCaption,
    imageCredit: row.imageCredit,
    galleryImages: parseGallery(row.galleryImages),
    videoUrl: row.videoUrl ?? undefined,
    verificationStatus: row.verificationStatus,
    sources: JSON.parse(row.sources) as string[],
    featuredLevel: row.featuredLevel as 0 | 1 | 2 | 3,
    isBreaking: row.isBreaking,
    breakingExpiresAt: row.breakingExpiresAt?.toISOString(),
    viewCount: row.viewCount,
  };
}

export function mapFactCheck(row: PrismaFactCheck): FactCheck {
  return {
    slug: row.slug,
    claim: row.claim,
    verdict: row.verdict,
    explanation: row.explanation,
    sources: JSON.parse(row.sources) as string[],
    publishedAt: row.publishedAt.toISOString(),
    relatedArticleSlugs: JSON.parse(row.relatedArticleSlugs) as string[],
  };
}
