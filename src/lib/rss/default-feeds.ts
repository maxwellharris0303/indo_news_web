import type { AiRewriteProvider, RssScrapeMode } from "@prisma/client";

export type DefaultFeedSeed = {
  name: string;
  siteUrl: string;
  feedUrl: string;
  scrapeMode: RssScrapeMode;
  defaultCategory: string;
  defaultAiProvider: AiRewriteProvider;
};

const sindonewsChannelDefaults = {
  scrapeMode: "FETCH_ARTICLE" as const,
  defaultAiProvider: "OPENAI" as const,
};

/** SINDOnews per-channel RSS (replaces single www homepage feed). */
export const SINDONEWS_CHANNEL_FEEDS: DefaultFeedSeed[] = [
  {
    name: "Sindonews · Nasional",
    siteUrl: "https://nasional.sindonews.com",
    feedUrl: "https://nasional.sindonews.com/rss",
    defaultCategory: "nasional",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Daerah",
    siteUrl: "https://daerah.sindonews.com",
    feedUrl: "https://daerah.sindonews.com/rss",
    defaultCategory: "daerah",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Lifestyle",
    siteUrl: "https://lifestyle.sindonews.com",
    feedUrl: "https://lifestyle.sindonews.com/rss",
    defaultCategory: "gaya-hidup",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Ekonomi",
    siteUrl: "https://ekbis.sindonews.com",
    feedUrl: "https://ekbis.sindonews.com/rss",
    defaultCategory: "ekonomi",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Tekno",
    siteUrl: "https://tekno.sindonews.com",
    feedUrl: "https://tekno.sindonews.com/rss",
    defaultCategory: "tekno",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Edukasi",
    siteUrl: "https://edukasi.sindonews.com",
    feedUrl: "https://edukasi.sindonews.com/rss",
    defaultCategory: "edukasi",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Multimedia",
    siteUrl: "https://media.sindonews.com",
    feedUrl: "google-news:media.sindonews.com",
    defaultCategory: "multimedia",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Internasional",
    siteUrl: "https://international.sindonews.com",
    feedUrl: "https://international.sindonews.com/rss",
    defaultCategory: "internasional",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Sports",
    siteUrl: "https://sports.sindonews.com",
    feedUrl: "https://sports.sindonews.com/rss",
    defaultCategory: "olahraga",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Otomotif",
    siteUrl: "https://otomotif.sindonews.com",
    feedUrl: "https://otomotif.sindonews.com/rss",
    defaultCategory: "tekno",
    ...sindonewsChannelDefaults,
  },
  {
    name: "Sindonews · Kalam",
    siteUrl: "https://kalam.sindonews.com",
    feedUrl: "https://kalam.sindonews.com/rss",
    defaultCategory: "opini",
    ...sindonewsChannelDefaults,
  },
];

/** Old single-feed URL — superseded by channel feeds; disabled on seed. */
export const LEGACY_SINDONEWS_FEED_URLS = [
  "https://sindonews.com/rss",
  "https://www.sindonews.com/rss",
  "https://www.sindonews.com/feed",
] as const;

/** Known or common RSS endpoints — editable in admin if URLs change. */
export const DEFAULT_RSS_FEEDS: DefaultFeedSeed[] = [
  {
    name: "Antara · Top News",
    siteUrl: "https://www.antaranews.com",
    feedUrl: "https://www.antaranews.com/rss/top-news.xml",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Antara · Ekonomi",
    siteUrl: "https://www.antaranews.com",
    feedUrl: "https://www.antaranews.com/rss/ekonomi.xml",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "ekonomi",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Antara · Politik",
    siteUrl: "https://www.antaranews.com",
    feedUrl: "https://www.antaranews.com/rss/politik.xml",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "politik-hukum",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Kompas.com",
    siteUrl: "https://www.kompas.com",
    feedUrl: "kompas-api:all",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Kompas · Nasional",
    siteUrl: "https://www.kompas.com",
    feedUrl: "kompas-api:nasional",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Kompas · Ekonomi",
    siteUrl: "https://www.kompas.com",
    feedUrl: "kompas-api:ekonomi",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "ekonomi",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Liputan6 · News",
    siteUrl: "https://www.liputan6.com",
    feedUrl: "https://feed.liputan6.com/rss/news",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Liputan6 · Hot",
    siteUrl: "https://www.liputan6.com",
    feedUrl: "https://feed.liputan6.com/rss/hot",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "gaya-hidup",
    defaultAiProvider: "OPENAI",
  },
  ...SINDONEWS_CHANNEL_FEEDS,
  {
    name: "iNews.id",
    siteUrl: "https://www.inews.id",
    feedUrl: "https://www.inews.id/feed",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Suara.com · News",
    siteUrl: "https://www.suara.com",
    feedUrl: "google-news:suara.com",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "Inilah.com",
    siteUrl: "https://www.inilah.com",
    feedUrl: "google-news:inilah.com",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "nasional",
    defaultAiProvider: "OPENAI",
  },
  {
    name: "DDTC (news.ddtc.co.id)",
    siteUrl: "https://news.ddtc.co.id",
    feedUrl: "sitemap:https://news.ddtc.co.id/terbaru/sitemap_news.xml",
    scrapeMode: "FETCH_ARTICLE",
    defaultCategory: "ekonomi",
    defaultAiProvider: "OPENAI",
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
        defaultCategory: feed.defaultCategory,
      },
    });
  }

  await prisma.rssFeed.updateMany({
    where: { feedUrl: { in: [...LEGACY_SINDONEWS_FEED_URLS] } },
    data: { enabled: false },
  });

  const deprecatedFeedUrls = [
    "https://www.antaranews.com/rss/nasional.xml",
    "https://feed.liputan6.com/rss",
    "https://www.kompas.com/rss",
    "https://www.kompas.com/rss/read/all/",
    "https://www.suara.com/rss",
    "https://www.suara.com/rss/news",
    "https://www.inews.id/rss/latest",
    "https://www.inilah.com/rss/feed/",
    "https://news.ddtc.co.id/rss",
    "https://media.sindonews.com/rss",
  ];
  await prisma.rssFeed.updateMany({
    where: { feedUrl: { in: deprecatedFeedUrls } },
    data: { enabled: false },
  });

  /** Point existing DB rows at working endpoints without duplicating names. */
  const feedUrlReplacements: { from: string; to: string }[] = [
    {
      from: "https://www.kompas.com/rss/read/all/",
      to: "kompas-api:all",
    },
    { from: "google-news:kompas.com", to: "kompas-api:all" },
    { from: "https://www.suara.com/rss/news", to: "google-news:suara.com" },
    { from: "https://www.inews.id/rss/latest", to: "https://www.inews.id/feed" },
    { from: "https://www.inilah.com/rss/feed/", to: "google-news:inilah.com" },
    {
      from: "https://news.ddtc.co.id/rss",
      to: "sitemap:https://news.ddtc.co.id/terbaru/sitemap_news.xml",
    },
    {
      from: "https://media.sindonews.com/rss",
      to: "google-news:media.sindonews.com",
    },
  ];
  for (const { from, to } of feedUrlReplacements) {
    const row = await prisma.rssFeed.findUnique({ where: { feedUrl: from } });
    if (!row) continue;
    const conflict = await prisma.rssFeed.findUnique({ where: { feedUrl: to } });
    if (conflict) {
      await prisma.rssFeed.update({
        where: { id: row.id },
        data: { enabled: false },
      });
    } else {
      await prisma.rssFeed.update({
        where: { id: row.id },
        data: { feedUrl: to, enabled: true, lastError: null, errorCount: 0 },
      });
    }
  }
}
