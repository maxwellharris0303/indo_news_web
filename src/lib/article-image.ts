import { coverImage } from "@/lib/content/seed";

/** Hostnames allowed for next/image optimization. */
export const NEXT_IMAGE_HOSTS = [
  "picsum.photos",
  "i.picsum.photos",
  "fastly.picsum.photos",
] as const;

/** Must stay in sync with next.config.ts remotePatterns. */
export const PUBLISHER_IMAGE_SUFFIXES = [
  "sindonews.net",
  "sindonews.com",
  "kompas.com",
  "kompas.tv",
  "liputan6.com",
  "antaranews.com",
  "inews.id",
  "suara.com",
  "inilah.com",
  "ddtc.co.id",
] as const;

export function normalizeImageUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  let url = raw.trim();
  if (url.startsWith("//")) url = `https:${url}`;
  if (url.startsWith("http://")) url = `https://${url.slice(7)}`;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function isNextImageHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (NEXT_IMAGE_HOSTS.includes(host as (typeof NEXT_IMAGE_HOSTS)[number])) {
      return true;
    }
    if (
      NEXT_IMAGE_HOSTS.some(
        (allowed) => host === allowed || host.endsWith(`.${allowed}`),
      )
    ) {
      return true;
    }
    return PUBLISHER_IMAGE_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}

/** Stable placeholder when publisher hotlink fails or domain is not configured. */
export function picsumCoverForSlug(slug: string): string {
  return coverImage(slug.slice(0, 24).replace(/[^a-z0-9-]/gi, "") || "rss");
}

/**
 * Pick URL to store on Article: use publisher image if valid HTTPS,
 * otherwise picsum (always works with next/image).
 */
export function resolveStoredArticleImageUrl(
  publisherUrl: string | null | undefined,
  slug: string,
): string {
  const normalized = normalizeImageUrl(publisherUrl);
  if (normalized && isNextImageHost(normalized)) {
    return normalized;
  }
  if (normalized) {
    return normalized;
  }
  return picsumCoverForSlug(slug);
}

/** URL safe to pass to next/image (known host or picsum fallback). */
export function nextImageSrc(storedUrl: string, slug: string): string {
  const normalized = normalizeImageUrl(storedUrl);
  if (normalized && isNextImageHost(normalized)) {
    return normalized;
  }
  if (normalized) {
    return normalized;
  }
  return picsumCoverForSlug(slug);
}
