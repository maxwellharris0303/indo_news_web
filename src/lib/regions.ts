/** Province hub slugs under /daerah/provinsi/[slug] (not article slugs). */
export const regionHubSlugs = [
  "dki-jakarta",
  "jawa-barat",
  "jawa-timur",
  "jawa-tengah",
  "bali",
  "sulawesi-selatan",
] as const;

export type RegionHubSlug = (typeof regionHubSlugs)[number];

export function isRegionHubSlug(value: string): value is RegionHubSlug {
  return (regionHubSlugs as readonly string[]).includes(value);
}
