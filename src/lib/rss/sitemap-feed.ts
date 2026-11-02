import { fetchFeedXml } from "@/lib/rss/http-fetch";
import type { ParsedFeed, ParsedFeedItem } from "@/lib/rss/parse-feed";

function extractTag(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m?.[1]?.trim();
}

export function parseNewsSitemapXml(xml: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/gi) ?? [];
  for (const block of urlBlocks) {
    const loc = extractTag(block, "loc");
    if (!loc?.startsWith("http")) continue;
    const title =
      extractTag(block, "news:title") ??
      extractTag(block, "title") ??
      loc;
    const pubRaw =
      extractTag(block, "news:publication_date") ??
      extractTag(block, "lastmod");
    let pubDate: Date | undefined;
    if (pubRaw) {
      const d = new Date(pubRaw);
      if (!Number.isNaN(d.getTime())) pubDate = d;
    }
    items.push({
      guid: loc,
      link: loc,
      title,
      pubDate,
      summaryRaw: title,
    });
  }
  return items;
}

export async function fetchAndParseNewsSitemap(
  sitemapUrl: string,
  xml?: string,
): Promise<ParsedFeed> {
  const body =
    xml ??
    (await fetchFeedXml(sitemapUrl)).xml;
  const items = parseNewsSitemapXml(body);
  if (items.length === 0) {
    throw new Error("Sitemap parsed but has no URLs");
  }
  items.sort(
    (a, b) =>
      (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0),
  );
  return { title: sitemapUrl, items: items.slice(0, 50) };
}
