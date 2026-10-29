/** Public URL for an article (handles Daerah kanal routing). */
export function articlePublicHref(category: string, slug: string): string {
  if (category === "daerah") {
    return `/daerah/${slug}`;
  }
  return `/${category}/${slug}`;
}
