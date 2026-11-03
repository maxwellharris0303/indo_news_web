import type { RssItemStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const QUEUE_STATUS: RssItemStatus[] = ["NEW", "FAILED"];

export async function listNewRssItemIds(input: {
  limit: number;
  feedId?: string;
}): Promise<string[]> {
  const rows = await prisma.rssItem.findMany({
    where: {
      articleId: null,
      status: { in: QUEUE_STATUS },
      ...(input.feedId ? { feedId: input.feedId } : {}),
    },
    orderBy: { pubDate: "desc" },
    take: Math.min(Math.max(input.limit, 1), 500),
    select: { id: true },
  });
  return rows.map((r) => r.id);
}
