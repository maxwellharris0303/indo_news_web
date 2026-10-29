export type ParsedSource = {
  label: string;
  href?: string;
  note?: string;
};

const URL_RE = /https?:\/\/[^\s)>\]"']+/gi;

function extractUrls(text: string): string[] {
  return [...text.matchAll(URL_RE)].map((m) => m[0].replace(/[.,;]+$/, ""));
}

export function parseArticleSources(raw: string[]): ParsedSource[] {
  const seenUrls = new Set<string>();
  const out: ParsedSource[] = [];

  for (const entry of raw) {
    const trimmed = entry?.trim();
    if (!trimmed) continue;

    try {
      const obj = JSON.parse(trimmed) as {
        label?: string;
        href?: string;
        note?: string;
      };
      if (obj && (obj.label || obj.href)) {
        const href = obj.href?.trim();
        if (href) {
          if (seenUrls.has(href)) continue;
          seenUrls.add(href);
        }
        out.push({
          label: obj.label?.trim() || href || "Sumber",
          href,
          note: obj.note?.trim(),
        });
        continue;
      }
    } catch {
      /* plain string */
    }

    const urls = extractUrls(trimmed);
    const primaryUrl = urls[0];
    if (primaryUrl && seenUrls.has(primaryUrl) && urls.every((u) => seenUrls.has(u))) {
      continue;
    }
    for (const u of urls) seenUrls.add(u);

    if (urls.length === 1 && trimmed === primaryUrl) {
      out.push({ label: hostnameLabel(primaryUrl), href: primaryUrl });
      continue;
    }

    if (urls.length === 1) {
      const withoutUrl = trimmed.replace(primaryUrl, "").replace(/[()]/g, "").trim();
      const label =
        withoutUrl.replace(/^sumber:?\s*/i, "").trim() ||
        hostnameLabel(primaryUrl);
      if (!out.some((s) => s.href === primaryUrl)) {
        out.push({
          label: label.slice(0, 120),
          href: primaryUrl,
        });
      }
      continue;
    }

    if (!urls.length) {
      const lower = trimmed.toLowerCase();
      const redundantLabel = out.some(
        (s) =>
          s.label.toLowerCase() === lower ||
          s.label.toLowerCase().includes(lower) ||
          lower.includes(s.label.toLowerCase()),
      );
      if (!redundantLabel && !out.some((s) => s.label === trimmed)) {
        out.push({ label: trimmed });
      }
    }
  }

  if (out.length === 0 && raw.length > 0) {
    const joined = raw.filter(Boolean).join(" · ");
    if (joined) out.push({ label: joined.slice(0, 200) });
  }

  return out;
}

function hostnameLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const parts = host.split(".");
    if (parts.length >= 2) {
      return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
    }
    return host;
  } catch {
    return "Sumber";
  }
}
