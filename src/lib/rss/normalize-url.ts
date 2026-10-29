export function normalizeArticleUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const key of [...u.searchParams.keys()]) {
      if (
        key.startsWith("utm_") ||
        key === "fbclid" ||
        key === "gclid" ||
        key === "ref"
      ) {
        u.searchParams.delete(key);
      }
    }
    const sorted = [...u.searchParams.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    );
    u.search = "";
    for (const [k, v] of sorted) {
      u.searchParams.append(k, v);
    }
    return u.toString();
  } catch {
    return url.trim();
  }
}

export function contentHash(title: string, link: string): string {
  const raw = `${title.trim().toLowerCase()}|${normalizeArticleUrl(link)}`;
  let h = 0;
  for (let i = 0; i < raw.length; i += 1) {
    h = (h << 5) - h + raw.charCodeAt(i);
    h |= 0;
  }
  return `h${Math.abs(h).toString(36)}`;
}
