import type { RssFeed } from "@prisma/client";
import { prisma } from "@/lib/db";
import { contentHash, normalizeArticleUrl } from "@/lib/rss/normalize-url";
import { fetchAndParseFeed } from "@/lib/rss/parse-feed";
import { scrapeArticlePage } from "@/lib/rss/scrape-article";

export type PollFeedResult = {
  feedId: string;
  name: string;
  notModified: boolean;
  newItems: number;
  error?: string;
};

export async function pollSingleFeed(feed: RssFeed): Promise<PollFeedResult> {
  const base: PollFeedResult = {
    feedId: feed.id,
    name: feed.name,
    notModified: false,
    newItems: 0,
  };
  try {
    const { feed: parsed, etag, lastModified, notModified } =
      await fetchAndParseFeed(feed.feedUrl, {
        etag: feed.etag,
        lastModified: feed.lastModified,
      });

    if (notModified) {
      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: { lastFetchedAt: new Date(), lastError: null, errorCount: 0 },
      });
      return { ...base, notModified: true };
    }

    let newItems = 0;
    for (const item of parsed.items) {
      const link = normalizeArticleUrl(item.link);
      const guid = item.guid.trim() || link;
      const hash = contentHash(item.title, link);

      const existing = await prisma.rssItem.findUnique({
        where: { feedId_guid: { feedId: feed.id, guid } },
      });
      if (existing) continue;

      const dupLink = await prisma.rssItem.findFirst({
        where: { link },
        select: { id: true },
      });
      if (dupLink) continue;

      let extractedBody: string | undefined;
      let imageUrl = item.imageUrl;
      if (feed.scrapeMode === "FETCH_ARTICLE") {
        const scraped = await scrapeArticlePage(link);
        if (scraped.ok) {
          extractedBody = scraped.textContent;
          if (scraped.imageUrl) imageUrl = scraped.imageUrl;
        }
      }

      await prisma.rssItem.create({
        data: {
          feedId: feed.id,
          guid,
          link,
          title: item.title,
          summaryRaw: item.summaryRaw,
          contentRaw: item.contentRaw,
          extractedBody,
          pubDate: item.pubDate,
          imageUrl,
          contentHash: hash,
          status: "NEW",
        },
      });
      newItems += 1;
    }

    await prisma.rssFeed.update({
      where: { id: feed.id },
      data: {
        lastFetchedAt: new Date(),
        etag: etag ?? feed.etag,
        lastModified: lastModified ?? feed.lastModified,
        lastError: null,
        errorCount: 0,
      },
    });

    return { ...base, newItems };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Poll gagal";
    await prisma.rssFeed.update({
      where: { id: feed.id },
      data: {
        lastFetchedAt: new Date(),
        lastError: message,
        errorCount: { increment: 1 },
      },
    });
    return { ...base, error: message };
  }
}

export async function pollAllEnabledFeeds(): Promise<PollFeedResult[]> {
  const feeds = await prisma.rssFeed.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
  });
  const results: PollFeedResult[] = [];
  for (const feed of feeds) {
    results.push(await pollSingleFeed(feed));
    await delay(800);
  }
  return results;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function ensureItemExtracted(
  itemId: string,
  scrapeMode: "RSS_ONLY" | "FETCH_ARTICLE",
): Promise<{ ok: true; body: string } | { ok: false; error: string }> {
  const item = await prisma.rssItem.findUnique({
    where: { id: itemId },
    include: { feed: true },
  });
  if (!item) return { ok: false, error: "Item tidak ditemukan" };

  if (item.extractedBody && item.extractedBody.length >= 120) {
    return { ok: true, body: item.extractedBody };
  }

  if (scrapeMode === "RSS_ONLY") {
    const fromRss =
      item.contentRaw?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
      item.summaryRaw?.trim() ||
      "";
    if (fromRss.length >= 80) {
      await prisma.rssItem.update({
        where: { id: itemId },
        data: { extractedBody: fromRss },
      });
      return { ok: true, body: fromRss };
    }
    return {
      ok: false,
      error: "RSS-only: konten feed terlalu pendek. Gunakan fetch halaman.",
    };
  }

  const scraped = await scrapeArticlePage(item.link);
  if (!scraped.ok) {
    return { ok: false, error: scraped.error };
  }
  await prisma.rssItem.update({
    where: { id: itemId },
    data: {
      extractedBody: scraped.textContent,
      imageUrl: item.imageUrl ?? scraped.imageUrl,
    },
  });
  return { ok: true, body: scraped.textContent };
}
