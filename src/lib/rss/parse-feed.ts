import Parser from "rss-parser";

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

export async function fetchAndParseFeed(
  feedUrl: string,
  conditional?: { etag?: string | null; lastModified?: string | null },
): Promise<{
  feed: ParsedFeed;
  etag?: string;
  lastModified?: string;
  notModified: boolean;
}> {
  const headers: Record<string, string> = {
    "User-Agent":
      "KabarDeskRSSBot/1.0 (+https://kabardesk.id; editorial ingest)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  };
  if (conditional?.etag) headers["If-None-Match"] = conditional.etag;
  if (conditional?.lastModified) {
    headers["If-Modified-Since"] = conditional.lastModified;
  }

  const res = await fetch(feedUrl, { headers, redirect: "follow" });
  if (res.status === 304) {
    return { feed: { items: [] }, notModified: true };
  }
  if (!res.ok) {
    throw new Error(`Feed HTTP ${res.status}`);
  }
  const xml = await res.text();
  const parsed = await parser.parseString(xml);
  const items: ParsedFeedItem[] = [];
  for (const item of parsed.items ?? []) {
    const mapped = mapParserItem(item);
    if (mapped) items.push(mapped);
  }
  return {
    feed: { title: parsed.title, items },
    etag: res.headers.get("etag") ?? undefined,
    lastModified: res.headers.get("last-modified") ?? undefined,
    notModified: false,
  };
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
