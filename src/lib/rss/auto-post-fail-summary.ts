/** Group rewrite errors for bulk auto-post finish messages. */

export function bucketAutoPostError(error?: string): string {
  if (!error?.trim()) return "Unknown error";
  const e = error.toLowerCase();
  if (e.includes("429") || e.includes("rate limit")) {
    return "OpenAI rate limit";
  }
  if (e.includes("openai_api_key") || e.includes("openai tidak")) {
    return "OpenAI API";
  }
  if (e.includes("http 403") || e.includes("403")) {
    return "Site blocked fetch (403)";
  }
  if (e.includes("http 451") || e.includes("451")) {
    return "Site blocked fetch (451)";
  }
  if (e.includes("http 404") || e.includes("404")) {
    return "Page not found (404)";
  }
  if (e.includes("rss-only") || e.includes("konten feed terlalu pendek")) {
    return "RSS snippet too short";
  }
  if (
    e.includes("terlalu pendek") ||
    e.includes("tidak terbaca") ||
    e.includes("too short")
  ) {
    return "Scrape: content too short";
  }
  if (
    e.includes("gagal fetch") ||
    e.includes("fetch failed") ||
    e.includes("abort")
  ) {
    return "Page fetch failed";
  }
  if (e.includes("rewrite masih berjalan")) {
    return "Rewrite still running";
  }
  if (e.includes("sudah dibuat")) {
    return "Article already exists";
  }
  if (error.length <= 72) return error;
  return `${error.slice(0, 69)}…`;
}

export function mergeFailBuckets(
  current: Record<string, number>,
  errors: (string | undefined)[],
): Record<string, number> {
  const next = { ...current };
  for (const err of errors) {
    if (!err) continue;
    const key = bucketAutoPostError(err);
    next[key] = (next[key] ?? 0) + 1;
  }
  return next;
}

export function formatAutoPostFailBreakdown(
  buckets: Record<string, number>,
  maxLines = 4,
): string {
  const entries = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return "";
  const lines = entries.slice(0, maxLines).map(([label, n]) => `${n}× ${label}`);
  const rest = entries.length - lines.length;
  if (rest > 0) lines.push(`+${rest} more`);
  return lines.join(" · ");
}

export function buildAutoPostFinishMessage(input: {
  doneLabel: string;
  ok: number;
  fail: number;
  failBuckets: Record<string, number>;
  skippedGoogleNews?: number;
  skippedGoogleNewsNote?: (count: number) => string;
  publishedWord?: string;
  failedWord?: string;
}): string {
  const {
    doneLabel,
    ok,
    fail,
    failBuckets,
    skippedGoogleNews,
    skippedGoogleNewsNote,
    publishedWord = "published",
    failedWord = "failed",
  } = input;
  let msg = `${doneLabel}: ${ok} ${publishedWord}${fail ? `, ${fail} ${failedWord}` : ""}.`;
  const breakdown = formatAutoPostFailBreakdown(failBuckets);
  if (breakdown) msg += ` ${breakdown}`;
  if (skippedGoogleNews && skippedGoogleNews > 0 && skippedGoogleNewsNote) {
    msg += ` ${skippedGoogleNewsNote(skippedGoogleNews)}`;
  }
  return msg;
}
