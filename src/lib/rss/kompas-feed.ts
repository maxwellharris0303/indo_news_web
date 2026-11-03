import { fetchFeedXml } from "@/lib/rss/http-fetch";
import {
  mapParserItem,
  type ParsedFeed,
  type ParsedFeedItem,
} from "@/lib/rss/parse-feed";
import Parser from "rss-parser";

const parser = new Parser({ timeout: 25_000 });

const KOMPAS_BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Channels: social (all), nasional, ekonomi, … — see rss.kompas.com API docs. */
export function parseKompasApiFeedToken(feedUrl: string): string | null {
  if (feedUrl.startsWith("kompas-api:")) {
    return feedUrl.slice("kompas-api:".length).trim() || "social";
  }
  return null;
}

function kompasApiKey(): string {
  const key = process.env.KOMPAS_RSS_API_KEY?.trim();
  if (!key) {
    throw new Error("KOMPAS_RSS_API_KEY belum diset di server");
  }
  return key;
}

export function kompasOfficialRssUrl(channel: string): string {
  const ch = channel === "all" ? "all" : channel;
  return `https://www.kompas.com/getrss/${ch}`;
}

export function kompasApiFeedUrl(channel: string): string {
  const ch = channel === "all" ? "social" : channel;
  return `https://rss.kompas.com/api/feed/${encodeURIComponent(ch)}?apikey=${encodeURIComponent(kompasApiKey())}`;
}

type KompasApiRow = {
  title?: string;
  url?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  date?: string;
  publish_date?: string;
  image?: string;
  thumbnail?: string;
};

function mapKompasApiRows(rows: KompasApiRow[]): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  for (const row of rows) {
    const link = (row.url ?? row.link ?? "").trim();
    if (!link) continue;
    const title = (row.title ?? link).trim();
    const rawDate = row.pubDate ?? row.date ?? row.publish_date;
    const pubDate = rawDate ? new Date(rawDate) : undefined;
    items.push({
      guid: (row.guid ?? link).trim(),
      link,
      title,
      imageUrl: row.image ?? row.thumbnail,
      pubDate:
        pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
    });
  }
  return items;
}

async function parseKompasApiJson(body: string): Promise<ParsedFeed> {
  const json = JSON.parse(body) as unknown;
  let rows: KompasApiRow[] = [];
  if (Array.isArray(json)) {
    rows = json as KompasApiRow[];
  } else if (json && typeof json === "object") {
    const rec = json as Record<string, unknown>;
    if (Array.isArray(rec.data)) rows = rec.data as KompasApiRow[];
    else if (Array.isArray(rec.items)) rows = rec.items as KompasApiRow[];
    else if (rec.status === false) {
      throw new Error(String(rec.error ?? "Kompas API error"));
    }
  }
  const items = mapKompasApiRows(rows);
  if (items.length === 0) {
    throw new Error("Kompas API: no items");
  }
  return { title: "Kompas API", items };
}

async function fetchKompasOfficialRss(
  channel: string,
  conditional?: { etag?: string | null; lastModified?: string | null },
): Promise<{
  feed: ParsedFeed;
  etag?: string;
  lastModified?: string;
  notModified: boolean;
  resolvedFeedUrl: string;
}> {
  const url = kompasOfficialRssUrl(channel);
  const fetched = await fetchFeedXml(url, conditional, {
    "User-Agent": KOMPAS_BROWSER_UA,
    Accept: "application/rss+xml, application/xml, text/xml, */*",
    Referer: "https://www.kompas.com/",
  });
  if (fetched.notModified) {
    return {
      feed: { items: [] },
      notModified: true,
      resolvedFeedUrl: url,
      etag: fetched.etag,
      lastModified: fetched.lastModified,
    };
  }
  if (!fetched.xml.trim()) {
    throw new Error("Kompas RSS empty response");
  }
  const parsed = await parser.parseString(fetched.xml);
  const items: ParsedFeedItem[] = [];
  for (const item of parsed.items ?? []) {
    const mapped = mapParserItem(item);
    if (mapped) items.push(mapped);
  }
  if (items.length === 0) {
    throw new Error("Kompas RSS: no items");
  }
  return {
    feed: { title: parsed.title ?? "Kompas", items },
    etag: fetched.etag,
    lastModified: fetched.lastModified,
    notModified: false,
    resolvedFeedUrl: fetched.usedUrl,
  };
}

export async function fetchAndParseKompasFeed(
  channel: string,
  conditional?: { etag?: string | null; lastModified?: string | null },
): Promise<{
  feed: ParsedFeed;
  etag?: string;
  lastModified?: string;
  notModified: boolean;
  resolvedFeedUrl: string;
}> {
  const hasApiKey = Boolean(process.env.KOMPAS_RSS_API_KEY?.trim());
  const attempts: { label: string; run: () => Promise<ParsedFeed> }[] = [];

  if (hasApiKey) {
    const apiUrl = kompasApiFeedUrl(channel);
    attempts.push({
      label: "api",
      run: async () => {
        const fetched = await fetchFeedXml(apiUrl, conditional, {
          "User-Agent": KOMPAS_BROWSER_UA,
          Accept: "application/json, application/rss+xml, application/xml, */*",
          Referer: "https://www.kompas.com/",
        });
        if (fetched.notModified) {
          throw new Error("__NOT_MODIFIED__");
        }
        const ct = fetched.contentType ?? "";
        if (ct.includes("json") || fetched.xml.trim().startsWith("{")) {
          return parseKompasApiJson(fetched.xml);
        }
        const parsed = await parser.parseString(fetched.xml);
        const items: ParsedFeedItem[] = [];
        for (const item of parsed.items ?? []) {
          const mapped = mapParserItem(item);
          if (mapped) items.push(mapped);
        }
        if (items.length === 0) throw new Error("Kompas API RSS empty");
        return { title: parsed.title ?? "Kompas", items };
      },
    });
  }

  attempts.push({
    label: "getrss",
    run: async () => {
      const r = await fetchKompasOfficialRss(channel, conditional);
      if (r.notModified) throw new Error("__NOT_MODIFIED__");
      return r.feed;
    },
  });

  let lastError: Error | undefined;
  for (const attempt of attempts) {
    try {
      const feed = await attempt.run();
      return {
        feed,
        notModified: false,
        resolvedFeedUrl: hasApiKey
          ? kompasApiFeedUrl(channel)
          : kompasOfficialRssUrl(channel),
      };
    } catch (e) {
      if (e instanceof Error && e.message === "__NOT_MODIFIED__") {
        return {
          feed: { items: [] },
          notModified: true,
          resolvedFeedUrl: kompasOfficialRssUrl(channel),
        };
      }
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError ?? new Error("Kompas feed failed");
}
