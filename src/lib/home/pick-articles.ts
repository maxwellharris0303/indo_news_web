import type { Article } from "@/lib/content/types";

/** Take the next N articles from a pool, skipping ids already shown above the fold. */
export function pickArticles(
  pool: Article[],
  count: number,
  pinned: Set<string>,
): Article[] {
  const picked: Article[] = [];
  for (const article of pool) {
    if (pinned.has(article.id)) continue;
    picked.push(article);
    pinned.add(article.id);
    if (picked.length >= count) break;
  }
  return picked;
}
