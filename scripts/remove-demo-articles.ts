/**
 * Archive demo/seed articles on production (keeps RSS_REWRITE and staff originals if any).
 * Run: npx tsx scripts/remove-demo-articles.ts
 */
import { PrismaClient } from "@prisma/client";
import { articles as seedArticles } from "../src/lib/content/seed";

const prisma = new PrismaClient();

const SEED_IDS = new Set(seedArticles.map((a) => a.id));
const SEED_SLUGS = new Set(seedArticles.map((a) => a.slug));

async function main() {
  const demoRows = await prisma.article.findMany({
    where: {
      status: { not: "ARCHIVED" },
      OR: [
        { editorialOrigin: "ORIGINAL" },
        { id: { in: [...SEED_IDS] } },
        { slug: { in: [...SEED_SLUGS] } },
        { slug: "e2e-automation-test-article" },
        { id: "e2e-auto-article" },
      ],
      NOT: { editorialOrigin: "RSS_REWRITE" },
    },
    select: { id: true, slug: true, category: true, title: true },
  });

  if (demoRows.length === 0) {
    console.log("No demo articles to archive.");
    return;
  }

  const ids = demoRows.map((r) => r.id);
  await prisma.comment.deleteMany({ where: { articleId: { in: ids } } });
  await prisma.savedArticle.deleteMany({ where: { articleId: { in: ids } } });
  await prisma.readingHistory.deleteMany({ where: { articleId: { in: ids } } });
  await prisma.articleTopic.deleteMany({ where: { articleId: { in: ids } } });

  const updated = await prisma.article.updateMany({
    where: { id: { in: ids } },
    data: { status: "ARCHIVED", featuredLevel: 0, isBreaking: false, isDeveloping: false },
  });

  console.log(`Archived ${updated.count} demo article(s):`);
  for (const row of demoRows.slice(0, 15)) {
    console.log(`  - /${row.category}/${row.slug}`);
  }
  if (demoRows.length > 15) {
    console.log(`  … and ${demoRows.length - 15} more`);
  }

  const published = await prisma.article.count({
    where: { status: { in: ["PUBLISHED", "CORRECTED"] } },
  });
  const rss = await prisma.article.count({
    where: {
      status: { in: ["PUBLISHED", "CORRECTED"] },
      editorialOrigin: "RSS_REWRITE",
    },
  });
  console.log(`Remaining public: ${published} (${rss} RSS)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
