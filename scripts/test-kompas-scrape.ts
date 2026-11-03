import { prisma } from "../src/lib/db";
import { scrapeArticlePage } from "../src/lib/rss/scrape-article";
import { scrapeKompasArticlePage } from "../src/lib/rss/kompas-scrape";

async function main() {
  const item = await prisma.rssItem.findFirst({
    where: {
      link: { contains: "kompas.com" },
      OR: [{ status: "FAILED" }, { status: "NEW" }],
    },
    orderBy: { pubDate: "desc" },
  });
  const url =
    item?.link ??
    process.argv[2] ??
    "https://www.kompas.com/nasional/read/2025/11/03/1234567890/example";
  console.log("URL:", url);
  const generic = await scrapeArticlePage(url);
  console.log("generic:", generic.ok ? `OK ${generic.textContent?.length}` : generic.error);
  const kompas = await scrapeKompasArticlePage(url);
  console.log("kompas:", kompas.ok ? `OK ${kompas.textContent.length}` : kompas.error);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
