import { prisma } from "@/lib/db";
import { topics as seedTopics } from "@/lib/content/seed";
import { mapTopic } from "@/lib/content/mappers";
import type { Topic } from "@/lib/content/types";
import {
  getTopicFromCatalog,
  homepageTopicSlugs,
  topicCatalog,
} from "@/lib/topics/catalog";
import { sortTopicsHomepageOrder } from "@/lib/topics/sort";

async function hasDbArticles(): Promise<boolean> {
  try {
    const count = await prisma.article.count();
    return count > 0;
  } catch {
    return false;
  }
}

export async function getTopics(): Promise<Topic[]> {
  if (!(await hasDbArticles())) return sortTopicsHomepageOrder(seedTopics);
  const rows = await prisma.topic.findMany();
  return sortTopicsHomepageOrder(rows.map(mapTopic));
}

export async function getTopic(slug: string): Promise<Topic | undefined> {
  if (!(await hasDbArticles())) {
    return seedTopics.find((t) => t.slug === slug) ?? getTopicFromCatalog(slug);
  }
  const row = await prisma.topic.findUnique({ where: { slug } });
  if (row) return mapTopic(row);
  return getTopicFromCatalog(slug);
}

export async function getHomepageTopics(): Promise<Topic[]> {
  const all = await getTopics();
  const allowed = new Set<string>(homepageTopicSlugs);
  return all.filter((t) => allowed.has(t.slug));
}
