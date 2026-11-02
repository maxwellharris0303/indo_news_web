// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GoogleDecoder } = require("google-news-url-decoder") as {
  GoogleDecoder: new () => {
    decode: (
      url: string,
    ) => Promise<{ status: boolean; decoded_url?: string; message?: string }>;
    decodeBatch: (
      urls: string[],
    ) => Promise<
      { status: boolean; decoded_url?: string; source_url?: string }[]
    >;
  };
};

const decoder = new GoogleDecoder();

export function isGoogleNewsArticleUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.hostname === "news.google.com" &&
      (u.pathname.includes("/articles/") || u.pathname.includes("/read/"))
    );
  } catch {
    return false;
  }
}

/** Resolve news.google.com/rss/articles/… to the publisher URL when possible. */
export async function decodeGoogleNewsArticleUrl(
  googleUrl: string,
): Promise<string | null> {
  if (!isGoogleNewsArticleUrl(googleUrl)) return null;
  try {
    const result = await decoder.decode(googleUrl);
    if (result.status && result.decoded_url?.startsWith("http")) {
      return result.decoded_url;
    }
  } catch {
    return null;
  }
  return null;
}

export async function decodeGoogleNewsArticleUrlsBatch(
  googleUrls: string[],
): Promise<(string | null)[]> {
  const toDecode = googleUrls.filter(isGoogleNewsArticleUrl);
  if (toDecode.length === 0) {
    return googleUrls.map((u) => (isGoogleNewsArticleUrl(u) ? null : u));
  }
  try {
    const results = await decoder.decodeBatch(toDecode);
    const bySource = new Map<string, string>();
    for (const r of results) {
      if (r.status && r.decoded_url && r.source_url) {
        bySource.set(r.source_url, r.decoded_url);
      }
    }
    return googleUrls.map((u) => {
      if (!isGoogleNewsArticleUrl(u)) return u;
      return bySource.get(u) ?? null;
    });
  } catch {
    return googleUrls.map((u) =>
      isGoogleNewsArticleUrl(u) ? null : u,
    );
  }
}
