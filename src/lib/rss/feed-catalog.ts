/**
 * Known RSS endpoints for major Indonesian publishers (primary + fallbacks).
 * Used when polling — tries each URL until one returns valid XML.
 */
export type PublisherFeedSpec = {
  publisherId: string;
  siteUrl: string;
  feedUrlCandidates: string[];
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
      "https://www.kompas.com/rss/read/all/",
      "https://www.kompas.com/rss",
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
    ],
  },
  {
    publisherId: "inews",
    siteUrl: "https://www.inews.id",
    feedUrlCandidates: [
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
    ],
  },
  {
    publisherId: "ddtc",
    siteUrl: "https://news.ddtc.co.id",
    feedUrlCandidates: [
      "https://news.ddtc.co.id/rss",
      "https://news.ddtc.co.id/feed",
      "https://news.ddtc.co.id/rss.xml",
    ],
  },
];

export function feedUrlCandidatesForSite(siteUrl: string): string[] {
  const normalized = siteUrl.replace(/\/$/, "");
  const spec = PUBLISHER_FEED_CATALOG.find(
    (p) => p.siteUrl.replace(/\/$/, "") === normalized,
  );
  return spec?.feedUrlCandidates ?? [];
}

export function orderedFeedUrls(
  primaryFeedUrl: string,
  siteUrl: string,
): string[] {
  const candidates = feedUrlCandidatesForSite(siteUrl);
  const ordered = [primaryFeedUrl, ...candidates];
  return [...new Set(ordered.map((u) => u.trim()).filter(Boolean))];
}
