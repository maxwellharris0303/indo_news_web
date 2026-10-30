import { getRecentNewsSitemapArticles } from "@/lib/content/repository";
import { site } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getRecentNewsSitemapArticles();
  const publicationName = escapeXml(site.name);
  const language = "id";

  const urls = articles
    .map((a) => {
      const loc = `${site.url}/${a.category}/${a.slug}`;
      const title = escapeXml(a.title);
      const pubDate = a.publishedAt.toISOString();
      return `<url>
  <loc>${loc}</loc>
  <news:news>
    <news:publication>
      <news:name>${publicationName}</news:name>
      <news:language>${language}</news:language>
    </news:publication>
    <news:publication_date>${pubDate}</news:publication_date>
    <news:title>${title}</news:title>
  </news:news>
</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
