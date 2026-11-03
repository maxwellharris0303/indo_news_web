import { prisma } from "@/lib/db";
import type { Topic } from "@/lib/content/types";
import { getTopicFromCatalog, homepageTopicSlugs } from "@/lib/topics/catalog";
import { getTopics } from "@/lib/topics/service";
import { sortTopicsHomepageOrder } from "@/lib/topics/sort";
import { topicCatalog } from "@/lib/topics/catalog";

export type TopicWithCount = Topic & { articleCount: number };

const PUBLISHED = ["PUBLISHED", "CORRECTED"] as const;

export async function countPublishedArticlesByTopic(): Promise<
  Map<string, number>
> {
  try {
    const rows = await prisma.articleTopic.groupBy({
      by: ["topicSlug"],
      where: {
        article: {
          status: { in: [...PUBLISHED] },
          publishedAt: { lte: new Date() },
        },
      },
      _count: { topicSlug: true },
    });
    return new Map(rows.map((r) => [r.topicSlug, r._count.topicSlug]));
  } catch {
    return new Map();
  }
}

export async function getTopicsWithCounts(): Promise<TopicWithCount[]> {
  const topics = await getTopics();
  const counts = await countPublishedArticlesByTopic();
  return topics.map((t) => ({
    ...t,
    articleCount: counts.get(t.slug) ?? 0,
  }));
}

/** Homepage chips: editorial order, only topics with published stories. */
export async function getHomepageTopicsWithCounts(): Promise<TopicWithCount[]> {
  const all = await getTopicsWithCounts();
  const allowed = new Set<string>(homepageTopicSlugs);
  return sortTopicsHomepageOrder(
    all.filter((t) => allowed.has(t.slug) && t.articleCount > 0),
  );
}

export async function getTopicWithCount(
  slug: string,
): Promise<TopicWithCount | undefined> {
  const topic = getTopicFromCatalog(slug) ?? (await getTopics()).find((t) => t.slug === slug);
  if (!topic) return undefined;
  try {
    const count = await prisma.article.count({
      where: {
        status: { in: [...PUBLISHED] },
        topics: { some: { topicSlug: slug } },
      },
    });
    return { ...topic, articleCount: count };
  } catch {
    return { ...topic, articleCount: 0 };
  }
}

export function catalogTopicsForSeed(): Topic[] {
  return sortTopicsHomepageOrder(topicCatalog);
}
