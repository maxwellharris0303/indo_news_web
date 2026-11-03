import { homepageTopicSlugs } from "@/lib/topics/catalog";

export function sortTopicsHomepageOrder<T extends { slug: string }>(
  items: T[],
): T[] {
  const order = new Map(homepageTopicSlugs.map((slug, i) => [slug, i]));
  return [...items].sort((a, b) => {
    const ai = order.get(a.slug as (typeof homepageTopicSlugs)[number]);
    const bi = order.get(b.slug as (typeof homepageTopicSlugs)[number]);
    if (ai !== undefined && bi !== undefined) return ai - bi;
    if (ai !== undefined) return -1;
    if (bi !== undefined) return 1;
    return a.slug.localeCompare(b.slug);
  });
}
