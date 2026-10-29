import type { MetadataRoute } from "next";
import { getAllArticlePaths } from "@/lib/content/repository";
import { categorySlugs, site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const staticRoutes = [
    "",
    "/daerah",
    "/opini",
    "/cek-fakta",
    "/indeks",
    "/search",
    ...categorySlugs.map((c) => `/${c}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: "2026-10-29T00:00:00.000Z",
  }));

  const paths = await getAllArticlePaths();
  const articles = paths.map(({ category, slug }) => ({
    url: `${base}/${category}/${slug}`,
    lastModified: "2026-10-29T00:00:00.000Z",
  }));

  return [...staticRoutes, ...articles];
}
