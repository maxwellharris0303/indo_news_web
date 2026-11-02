import {
  decodeGoogleNewsArticleUrl,
  decodeGoogleNewsArticleUrlsBatch,
} from "@/lib/rss/google-news-decode";
import { fetchFeedXml } from "@/lib/rss/http-fetch";
import {
  mapParserItem,
  type ParsedFeed,
  type ParsedFeedItem,
} from "@/lib/rss/parse-feed";
import Parser from "rss-parser";

const parser = new Parser({ timeout: 25_000 });

export function googleNewsRssUrlForSite(site: string): string {
  const q = encodeURIComponent(`site:${site.replace(/^https?:\/\//, "").replace(/\/$/, "")}`);
  return `https://news.google.com/rss/search?q=${q}&hl=id-ID&gl=ID&ceid=ID:id`;
}

export function parseGoogleNewsFeedToken(feedUrl: string): string | null {
  if (feedUrl.startsWith("google-news:")) {
    return feedUrl.slice("google-news:".length).trim();
  }
  return null;
}

export async function fetchAndParseGoogleNewsFeed(
  siteToken: string,
  conditional?: { etag?: string | null; lastModified?: string | null },
): Promise<{
  feed: ParsedFeed;
  etag?: string;
  lastModified?: string;
  notModified: boolean;
  resolvedFeedUrl: string;
}> {
  const rssUrl = siteToken.startsWith("http")
    ? siteToken
    : googleNewsRssUrlForSite(siteToken);

  const fetched = await fetchFeedXml(rssUrl, conditional);
  if (fetched.notModified) {
    return {
      feed: { items: [] },
      notModified: true,
      resolvedFeedUrl: rssUrl,
      etag: fetched.etag,
      lastModified: fetched.lastModified,
    };
  }

  const parsed = await parser.parseString(fetched.xml);
  const rawItems: ParsedFeedItem[] = [];
  for (const item of parsed.items ?? []) {
    const mapped = mapParserItem(item);
    if (mapped) rawItems.push(mapped);
  }
  if (rawItems.length === 0) {
    throw new Error("Google News feed has no items");
  }

  const batch = rawItems.slice(0, 20);
  const links = batch.map((i) => i.link);
  const decodedLinks = await decodeGoogleNewsArticleUrlsBatch(links);

  const items: ParsedFeedItem[] = [];
  batch.forEach((item, idx) => {
    const link = decodedLinks[idx] ?? item.link;
    if (link.includes("news.google.com")) return;
    items.push({
      ...item,
      link,
      guid: link,
    });
  });
  if (items.length === 0) {
    throw new Error("Google News feed: no decodable publisher links");
  }

  return {
    feed: { title: parsed.title ?? siteToken, items },
    etag: fetched.etag,
    lastModified: fetched.lastModified,
    notModified: false,
    resolvedFeedUrl: rssUrl,
  };
}
