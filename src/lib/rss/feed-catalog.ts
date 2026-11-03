/**
 * Known RSS endpoints for major Indonesian publishers (primary + fallbacks).
 * Used when polling — tries each URL until one returns valid XML.
 */
export type PublisherFeedSpec = {
  publisherId: string;
  siteUrl: string;
  feedUrlCandidates: string[];
};

/** When official RSS fails, poll Google News site search (decoded to publisher URLs). */
export const PUBLISHER_GOOGLE_NEWS_SITE: Record<string, string> = {
  "https://www.kompas.com": "kompas.com",
  "https://www.suara.com": "suara.com",
  "https://www.inilah.com": "inilah.com",
  "https://news.ddtc.co.id": "news.ddtc.co.id",
  "https://media.sindonews.com": "media.sindonews.com",
};

export const PUBLISHER_FEED_CATALOG: PublisherFeedSpec[] = [
  {
    publisherId: "antaranews",
    siteUrl: "https://www.antaranews.com",
    feedUrlCandidates: [
      "https://www.antaranews.com/rss/top-news.xml",
      "https://www.antaranews.com/rss/nasional.xml",
      "https://www.antaranews.com/rss/ekonomi.xml",
      "https://www.antaranews.com/rss/politik.xml",
      "https://www.antaranews.com/rss/hukum.xml",
    ],
  },
  {
    publisherId: "kompas",
    siteUrl: "https://www.kompas.com",
    feedUrlCandidates: [
      "kompas-api:all",
      "kompas-api:nasional",
      "kompas-api:ekonomi",
      "https://www.kompas.com/getrss/all",
      "https://www.kompas.com/getrss/nasional",
      "google-news:kompas.com",
    ],
  },
  {
    publisherId: "liputan6",
    siteUrl: "https://www.liputan6.com",
    feedUrlCandidates: [
      "https://feed.liputan6.com/rss/news",
      "https://feed.liputan6.com/rss/hot",
      "https://feed.liputan6.com/rss",
    ],
  },
  {
    publisherId: "sindonews",
    siteUrl: "https://www.sindonews.com",
    feedUrlCandidates: ["https://nasional.sindonews.com/rss"],
  },
  {
    publisherId: "suara",
    siteUrl: "https://www.suara.com",
    feedUrlCandidates: [
      "https://www.suara.com/rss/news",
      "https://www.suara.com/rss/bisnis",
      "https://www.suara.com/rss",
      "google-news:suara.com",
    ],
  },
  {
    publisherId: "inews",
    siteUrl: "https://www.inews.id",
    feedUrlCandidates: [
      "https://www.inews.id/feed",
      "https://www.inews.id/rss/latest",
      "https://www.inews.id/rss",
    ],
  },
  {
    publisherId: "inilah",
    siteUrl: "https://www.inilah.com",
    feedUrlCandidates: [
      "https://www.inilah.com/rss/feed/",
      "https://www.inilah.com/feed",
      "google-news:inilah.com",
    ],
  },
  {
    publisherId: "ddtc",
    siteUrl: "https://news.ddtc.co.id",
    feedUrlCandidates: [
      "sitemap:https://news.ddtc.co.id/terbaru/sitemap_news.xml",
      "https://news.ddtc.co.id/rss",
      "https://news.ddtc.co.id/feed",
      "google-news:news.ddtc.co.id",
    ],
  },
];

function normalizeSiteKey(siteUrl: string): string {
  return siteUrl.replace(/\/$/, "");
}

export function orderedFeedUrls(
  primaryFeedUrl: string,
  siteUrl: string,
): string[] {
  const candidates = feedUrlCandidatesForSite(siteUrl);
  const key = normalizeSiteKey(siteUrl);
  const googleToken = PUBLISHER_GOOGLE_NEWS_SITE[key];
  const ordered = [
    primaryFeedUrl,
    ...candidates,
    ...(googleToken && !primaryFeedUrl.startsWith("google-news:")
      ? [`google-news:${googleToken}`]
      : []),
  ];
  return [...new Set(ordered.map((u) => u.trim()).filter(Boolean))];
}

/** Match publisher catalog by hostname (e.g. nasional.sindonews.com). */
export function feedUrlCandidatesForSite(siteUrl: string): string[] {
  const normalized = normalizeSiteKey(siteUrl);
  const spec = PUBLISHER_FEED_CATALOG.find(
    (p) => normalizeSiteKey(p.siteUrl) === normalized,
  );
  if (spec) return spec.feedUrlCandidates;

  try {
    const host = new URL(normalized).hostname;
    if (host.endsWith(".sindonews.com")) {
      return [`https://${host}/rss`, "https://nasional.sindonews.com/rss"];
    }
  } catch {
    /* ignore */
  }

  return [];
}
