import type { AiRewriteProvider, RssScrapeMode } from "@prisma/client";

export type DefaultFeedSeed = {
  name: string;
  siteUrl: string;
  feedUrl: string;
  scrapeMode: RssScrapeMode;
  defaultCategory: string;
  defaultAiProvider: AiRewriteProvider;
};

/** Known or common RSS endpoints — editable in admin if URLs change. */
export const DEFAULT_RSS_FEEDS: DefaultFeedSeed[] = [
  {
    name: "Antara News",
    siteUrl: "https://www.antaranews.com",
    feedUrl: "https://www.antaranews.com/rss/nasional.xml",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Kompas.com",
    siteUrl: "https://www.kompas.com",
    feedUrl: "https://www.kompas.com/rss",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Liputan6",
    siteUrl: "https://www.liputan6.com",
    feedUrl: "https://feed.liputan6.com/rss",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Sindonews",
    siteUrl: "https://www.sindonews.com",
    feedUrl: "https://sindonews.com/rss",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "iNews.id",
    siteUrl: "https://www.inews.id",
    feedUrl: "https://www.inews.id/rss/latest",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Suara.com",
    siteUrl: "https://www.suara.com",
    feedUrl: "https://www.suara.com/rss",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Inilah.com",
    siteUrl: "https://www.inilah.com",
    feedUrl: "https://www.inilah.com/rss/feed/",
    scrapeMode: "RSS_ONLY",
    defaultCategory: "nasional",
    defaultAiProvider: "ANTHROPIC",
  },
  {
    name: "DDTC (news.ddtc.co.id)",
    siteUrl: "https://news.ddtc.co.id",
    feedUrl: "https://news.ddtc.co.id/rss",
    scrapeMode: "RSS_ONLY",
    defaultCategory: "ekonomi",
    defaultAiProvider: "ANTHROPIC",
  },
];

export async function seedDefaultRssFeeds() {
  const { prisma } = await import("@/lib/db");
  for (const feed of DEFAULT_RSS_FEEDS) {
    await prisma.rssFeed.upsert({
      where: { feedUrl: feed.feedUrl },
      create: {
        name: feed.name,
        siteUrl: feed.siteUrl,
        feedUrl: feed.feedUrl,
        scrapeMode: feed.scrapeMode,
        defaultCategory: feed.defaultCategory,
        defaultAiProvider: feed.defaultAiProvider,
        enabled: true,
      },
      update: {
        name: feed.name,
        siteUrl: feed.siteUrl,
      },
    });
  }
}
