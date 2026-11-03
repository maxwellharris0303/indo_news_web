import type { RssItemStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isGoogleNewsArticleUrl } from "@/lib/rss/google-news-decode";

const QUEUE_STATUS: RssItemStatus[] = ["NEW", "FAILED"];

/** Max rows scanned when building a queue (newest first). */
const SCAN_CAP = 500;

export function isSkippedForAutoPost(link: string): boolean {
  return isGoogleNewsArticleUrl(link);
}

export async function listNewRssItemIds(input: {
  limit: number;
  feedId?: string;
}): Promise<string[]> {
  const { ids } = await listAutoPostItemIds(input);
  return ids;
}

export async function listAutoPostItemIds(input: {
  limit: number;
  feedId?: string;
}): Promise<{ ids: string[]; skippedGoogleNews: number }> {
  const limit = Math.min(Math.max(input.limit, 1), 500);
  const rows = await prisma.rssItem.findMany({
    where: {
      articleId: null,
      status: { in: QUEUE_STATUS },
      ...(input.feedId ? { feedId: input.feedId } : {}),
    },
    orderBy: { pubDate: "desc" },
    take: SCAN_CAP,
    select: { id: true, link: true },
  });

  const ids: string[] = [];
  let skippedGoogleNews = 0;
  for (const row of rows) {
    if (isSkippedForAutoPost(row.link)) {
      skippedGoogleNews += 1;
      continue;
    }
    ids.push(row.id);
    if (ids.length >= limit) break;
  }

  return { ids, skippedGoogleNews };
}
