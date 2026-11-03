import { JSDOM } from "jsdom";
import {
  decodeGoogleNewsArticleUrl,
  isGoogleNewsArticleUrl,
} from "@/lib/rss/google-news-decode";
import type { ScrapeResult } from "@/lib/rss/scrape-article";

const KOMPAS_BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export function isKompasArticleUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "kompas.com" || host.endsWith(".kompas.com");
  } catch {
    return false;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchKompasHtml(url: string, timeoutMs = 25_000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": KOMPAS_BROWSER_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        Referer: "https://www.kompas.com/",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
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

function extractJsonLdBody(html: string): string | null {
  const re =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const raw = JSON.parse(m[1] ?? "{}") as unknown;
      const nodes = Array.isArray(raw) ? raw : [raw];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const rec = node as Record<string, unknown>;
        const type = rec["@type"];
        const isArticle =
          type === "NewsArticle" ||
          type === "Article" ||
          (Array.isArray(type) &&
            type.some((t) => t === "NewsArticle" || t === "Article"));
        if (!isArticle) continue;
        const body = rec.articleBody;
        if (typeof body === "string") {
          const text = stripHtml(body);
          if (text.length >= 120) return text;
        }
      }
    } catch {
      /* next block */
    }
  }
  return null;
}

function extractDomBody(html: string, pageUrl: string): string | null {
  const dom = new JSDOM(html, { url: pageUrl });
  const doc = dom.window.document;
  const root =
    doc.querySelector(".read__content") ??
    doc.querySelector(".detail__body-text") ??
    doc.querySelector(".article__content") ??
    doc.querySelector('[class*="read__content"]') ??
    doc.querySelector("article");
  if (!root) return null;

  const parts: string[] = [];
  for (const p of root.querySelectorAll("p")) {
    const t = p.textContent?.replace(/\s+/g, " ").trim();
    if (t && t.length > 20) parts.push(t);
  }
  if (parts.length >= 2) {
    return parts.join("\n\n");
  }
  const fallback = root.textContent?.replace(/\s+/g, " ").trim() ?? "";
  return fallback.length >= 120 ? fallback : null;
}

function findAmpUrl(html: string, baseUrl: string): string | null {
  const m =
    html.match(/<link[^>]+rel=["']amphtml["'][^>]+href=["']([^"']+)["']/i) ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']amphtml["']/i);
  if (!m?.[1]) return null;
  try {
    return new URL(m[1], baseUrl).toString();
  } catch {
    return null;
  }
}

export function extractKompasArticleFromHtml(
  html: string,
  pageUrl: string,
): ScrapeResult {
  const jsonLd = extractJsonLdBody(html);
  const domBody = jsonLd ?? extractDomBody(html, pageUrl);
  if (!domBody || domBody.length < 120) {
    return {
      ok: false,
      error: "Kompas: konten artikel terlalu pendek atau tidak terbaca",
    };
  }
  const title =
    html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1]
      ?.replace(/\s*-\s*Kompas\.com\s*$/i, "")
      .trim() ??
    new JSDOM(html, { url: pageUrl }).window.document.querySelector("h1")
      ?.textContent?.trim() ??
    "Tanpa judul";
  return {
    ok: true,
    title,
    textContent: domBody,
    excerpt: domBody.slice(0, 280),
    imageUrl: extractOgImage(html, pageUrl),
  };
}

export async function resolveKompasArticleUrl(
  url: string,
): Promise<string> {
  let resolved = url.trim();
  if (isGoogleNewsArticleUrl(resolved)) {
    const decoded = await decodeGoogleNewsArticleUrl(resolved);
    if (decoded) resolved = decoded;
  }
  return resolved;
}

export async function scrapeKompasArticlePage(
  url: string,
): Promise<ScrapeResult> {
  try {
    const pageUrl = await resolveKompasArticleUrl(url);
    if (!isKompasArticleUrl(pageUrl)) {
      return { ok: false, error: "Bukan URL Kompas" };
    }

    let html = await fetchKompasHtml(pageUrl);
    let result = extractKompasArticleFromHtml(html, pageUrl);
    if (result.ok) return result;

    const ampUrl = findAmpUrl(html, pageUrl);
    if (ampUrl) {
      html = await fetchKompasHtml(ampUrl);
      result = extractKompasArticleFromHtml(html, ampUrl);
      if (result.ok) return result;
    }

    return result;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal fetch halaman Kompas",
    };
  }
}
