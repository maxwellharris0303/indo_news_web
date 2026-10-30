const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BOT_UA =
  "KabarDeskRSSBot/1.0 (+https://kabardesk.id; editorial RSS ingest)";

function refererFor(url: string): string | undefined {
  try {
    const { origin } = new URL(url);
    return `${origin}/`;
  } catch {
    return undefined;
  }
}

export type FeedFetchResult = {
  xml: string;
  etag?: string;
  lastModified?: string;
  notModified: boolean;
  usedUrl: string;
};

export async function fetchFeedXml(
  feedUrl: string,
  conditional?: { etag?: string | null; lastModified?: string | null },
): Promise<FeedFetchResult> {
  const attempts: { ua: string; label: string }[] = [
    { ua: BROWSER_UA, label: "browser" },
    { ua: BOT_UA, label: "bot" },
  ];

  let lastError: Error | undefined;

  for (const { ua } of attempts) {
    const headers: Record<string, string> = {
      "User-Agent": ua,
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml, */*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    };
    const ref = refererFor(feedUrl);
    if (ref) headers.Referer = ref;
    if (conditional?.etag) headers["If-None-Match"] = conditional.etag;
    if (conditional?.lastModified) {
      headers["If-Modified-Since"] = conditional.lastModified;
    }

    try {
      const res = await fetch(feedUrl, {
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(28_000),
      });
      if (res.status === 304) {
        return {
          xml: "",
          notModified: true,
          usedUrl: feedUrl,
          etag: conditional?.etag ?? undefined,
          lastModified: conditional?.lastModified ?? undefined,
        };
      }
      if (!res.ok) {
        throw new Error(`Feed HTTP ${res.status}`);
      }
      const xml = await res.text();
      if (xml.trim().length < 80) {
        throw new Error("Feed body empty or too short");
      }
      return {
        xml,
        notModified: false,
        usedUrl: feedUrl,
        etag: res.headers.get("etag") ?? undefined,
        lastModified: res.headers.get("last-modified") ?? undefined,
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError ?? new Error("Feed fetch failed");
}
