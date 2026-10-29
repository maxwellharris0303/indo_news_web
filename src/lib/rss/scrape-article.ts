import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const USER_AGENT =
  "KabarDeskRSSBot/1.0 (+https://kabardesk.id; editorial ingest)";

export type ScrapeResult = {
  ok: true;
  title: string;
  textContent: string;
  excerpt: string;
  imageUrl?: string;
} | {
  ok: false;
  error: string;
};

export async function fetchHtml(url: string, timeoutMs = 20_000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractOgImage(html: string, baseUrl: string): string | undefined {
  const match =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ??
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
  if (!match?.[1]) return undefined;
  try {
    return new URL(match[1], baseUrl).toString();
  } catch {
    return undefined;
  }
}

export function extractArticleFromHtml(
  html: string,
  pageUrl: string,
): ScrapeResult {
  try {
    const dom = new JSDOM(html, { url: pageUrl });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    if (!article?.textContent || article.textContent.trim().length < 120) {
      return {
        ok: false,
        error: "Konten artikel terlalu pendek atau tidak terbaca",
      };
    }
    const ogImage = extractOgImage(html, pageUrl);
    return {
      ok: true,
      title: article.title?.trim() || "Tanpa judul",
      textContent: article.textContent.trim(),
      excerpt: article.excerpt?.trim() ?? "",
      imageUrl: ogImage,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal ekstrak HTML",
    };
  }
}

export async function scrapeArticlePage(url: string): Promise<ScrapeResult> {
  try {
    const html = await fetchHtml(url);
    return extractArticleFromHtml(html, url);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal fetch halaman",
    };
  }
}
