import type { MetadataRoute } from "next";
import { getPublishedArticlesForSitemap } from "@/lib/content/repository";
import { categorySlugs, site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const staticLastMod = new Date();

  const staticRoutes = [
    "",
    "/daerah",
    "/opini",
    "/cek-fakta",
    "/indeks",
    "/search",
    "/redaksi",
    ...categorySlugs.map((c) => `/${c}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: staticLastMod,
  }));

  const published = await getPublishedArticlesForSitemap();
  const articles = published.map(({ category, slug, publishedAt }) => ({
    url: `${base}/${category}/${slug}`,
    lastModified: publishedAt,
  }));

  return [...staticRoutes, ...articles];
}
