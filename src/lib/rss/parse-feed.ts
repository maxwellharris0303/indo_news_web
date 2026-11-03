import Parser from "rss-parser";
import { fetchFeedXml } from "@/lib/rss/http-fetch";
import { orderedFeedUrls } from "@/lib/rss/feed-catalog";
import {
  fetchAndParseGoogleNewsFeed,
  parseGoogleNewsFeedToken,
} from "@/lib/rss/google-news-feed";
import { fetchAndParseNewsSitemap } from "@/lib/rss/sitemap-feed";
import {
  fetchAndParseKompasFeed,
  parseKompasApiFeedToken,
} from "@/lib/rss/kompas-feed";

export type ParsedFeedItem = {
  guid: string;
  link: string;
  title: string;
  summaryRaw?: string;
  contentRaw?: string;
  pubDate?: Date;
  imageUrl?: string;
};

export type ParsedFeed = {
  title?: string;
  items: ParsedFeedItem[];
};

const parser = new Parser({
  timeout: 25_000,
  headers: {
    "User-Agent":
      "KabarDeskRSSBot/1.0 (+https://kabardesk.id; editorial ingest)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["media:content", "mediaContent", { keepArray: true }],
    ],
  },
});

function itemGuid(
  item: Parser.Item & { guid?: string; id?: string },
  link: string,
): string {
  const g = item.guid ?? item.id ?? link;
  return String(g).trim() || link;
}

function pickImage(item: Parser.Item): string | undefined {
  const extra = item as Parser.Item & {
    mediaContent?: { $?: { url?: string } }[];
    contentEncoded?: string;
  };
  const enc = item.enclosure;
  if (enc?.url && (enc.type?.startsWith("image/") || !enc.type)) {
    return enc.url;
  }
  const mediaUrl = extra.mediaContent?.[0]?.$?.url;
  if (mediaUrl) return mediaUrl;
  const content = item.content ?? extra.contentEncoded;
  if (typeof content === "string") {
    const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m?.[1]) return m[1];
  }
  return undefined;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapParserItem(item: Parser.Item): ParsedFeedItem | null {
  const link = (item.link ?? item.guid ?? "").trim();
  if (!link) return null;
  const title = (item.title ?? link).trim();
  const contentEncoded = (item as { contentEncoded?: string }).contentEncoded;
  const contentRaw =
    (typeof contentEncoded === "string" && contentEncoded) ||
    (typeof item.content === "string" && item.content) ||
    undefined;
  const summaryRaw =
    (typeof item.contentSnippet === "string" && item.contentSnippet) ||
    (typeof item.summary === "string" && item.summary) ||
    (contentRaw ? stripHtml(contentRaw).slice(0, 500) : undefined);
  const pubDate = item.isoDate
    ? new Date(item.isoDate)
    : item.pubDate
      ? new Date(item.pubDate)
      : undefined;
  return {
    guid: itemGuid(item, link),
    link,
    title,
    summaryRaw,
    contentRaw,
    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
    imageUrl: pickImage(item),
  };
}

export function parseSitemapFeedToken(feedUrl: string): string | null {
  if (feedUrl.startsWith("sitemap:")) {
    return feedUrl.slice("sitemap:".length).trim();
  }
  return null;
}

async function fetchAndParseOneFeedUrl(
  url: string,
  conditional?: {
    etag?: string | null;
    lastModified?: string | null;
  },
): Promise<{
  feed: ParsedFeed;
  etag?: string;
  lastModified?: string;
  notModified: boolean;
  resolvedFeedUrl: string;
}> {
  const kompasChannel = parseKompasApiFeedToken(url);
  if (kompasChannel) {
    const result = await fetchAndParseKompasFeed(kompasChannel, conditional);
    return {
      feed: result.feed,
      etag: result.etag,
      lastModified: result.lastModified,
      notModified: result.notModified,
      resolvedFeedUrl: result.resolvedFeedUrl,
    };
  }

  const googleSite = parseGoogleNewsFeedToken(url);
  if (googleSite) {
    const result = await fetchAndParseGoogleNewsFeed(googleSite, conditional);
    return {
      feed: result.feed,
      etag: result.etag,
      lastModified: result.lastModified,
      notModified: result.notModified,
      resolvedFeedUrl: result.resolvedFeedUrl,
    };
  }

  const sitemapUrl = parseSitemapFeedToken(url);
  if (sitemapUrl) {
    const fetched = await fetchFeedXml(sitemapUrl, conditional);
    if (fetched.notModified) {
      return {
        feed: { items: [] },
        notModified: true,
        resolvedFeedUrl: sitemapUrl,
        etag: fetched.etag,
        lastModified: fetched.lastModified,
      };
    }
    const feed = await fetchAndParseNewsSitemap(sitemapUrl, fetched.xml);
    return {
      feed,
      etag: fetched.etag,
      lastModified: fetched.lastModified,
      notModified: false,
      resolvedFeedUrl: sitemapUrl,
    };
  }

  const fetched = await fetchFeedXml(url, conditional);
  if (fetched.notModified) {
    return {
      feed: { items: [] },
      notModified: true,
      resolvedFeedUrl: url,
      etag: fetched.etag,
      lastModified: fetched.lastModified,
    };
  }
  const parsed = await parser.parseString(fetched.xml);
  const items: ParsedFeedItem[] = [];
  for (const item of parsed.items ?? []) {
    const mapped = mapParserItem(item);
    if (mapped) items.push(mapped);
  }
  if (items.length === 0 && (parsed.items?.length ?? 0) === 0) {
    throw new Error("Feed parsed but has no items");
  }
  return {
    feed: { title: parsed.title, items },
    etag: fetched.etag,
    lastModified: fetched.lastModified,
    notModified: false,
    resolvedFeedUrl: fetched.usedUrl,
  };
}

export async function fetchAndParseFeed(
  feedUrl: string,
  conditional?: {
    etag?: string | null;
    lastModified?: string | null;
    siteUrl?: string | null;
  },
): Promise<{
  feed: ParsedFeed;
  etag?: string;
  lastModified?: string;
  notModified: boolean;
  resolvedFeedUrl?: string;
}> {
  const urls = conditional?.siteUrl
    ? orderedFeedUrls(feedUrl, conditional.siteUrl)
    : [feedUrl];

  let lastError: Error | undefined;

  for (const url of urls) {
    try {
      const result = await fetchAndParseOneFeedUrl(url, conditional);
      return {
        feed: result.feed,
        etag: result.etag,
        lastModified: result.lastModified,
        notModified: result.notModified,
        resolvedFeedUrl: result.resolvedFeedUrl,
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError ?? new Error(`Feed HTTP failed for ${feedUrl}`);
}

/** Parse RSS XML string (for tests). */
export async function parseFeedXml(xml: string): Promise<ParsedFeed> {
  const parsed = await parser.parseString(xml);
  const items: ParsedFeedItem[] = [];
  for (const item of parsed.items ?? []) {
    const mapped = mapParserItem(item);
    if (mapped) items.push(mapped);
  }
  return { title: parsed.title, items };
}
