/** Visual identity helpers for RSS feed sources in admin UI. */

const BRAND_ACCENT: Record<string, string> = {
  "antaranews.com": "#c41e3a",
  "kompas.com": "#005cae",
  "liputan6.com": "#e6007e",
  "sindonews.com": "#0066cc",
  "inews.id": "#e30613",
  "suara.com": "#00a651",
  "inilah.com": "#ff6600",
  "ddtc.co.id": "#1a5276",
  "news.ddtc.co.id": "#1a5276",
};

export function feedHostname(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname.replace(/^www\./i, "");
  } catch {
    return siteUrl;
  }
}

export function feedFaviconUrl(siteUrl: string, size = 64): string {
  const host = feedHostname(siteUrl);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}

export function feedBrandAccent(siteUrl: string): string {
  const host = feedHostname(siteUrl);
  for (const [key, color] of Object.entries(BRAND_ACCENT)) {
    if (host === key || host.endsWith(`.${key}`)) return color;
  }
  return "#64748b";
}

export function feedInitials(name: string): string {
  const parts = name.replace(/[()]/g, " ").split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
