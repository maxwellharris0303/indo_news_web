/**
 * Attach inferred topics to published articles with no topic links.
 * Run: npx tsx scripts/backfill-article-topics.ts
 */
import { prisma } from "@/lib/db";
import { inferTopicSlugsFromText } from "@/lib/topics/infer-topics";
import { setArticleTopics } from "@/lib/topics/sync-article-topics";

async function main() {
  const rows = await prisma.article.findMany({
    where: {
      status: { in: ["PUBLISHED", "CORRECTED"] },
      topics: { none: {} },
    },
    select: { id: true, title: true, dek: true, body: true, category: true },
  });

  let updated = 0;
  for (const row of rows) {
    const slugs = inferTopicSlugsFromText({
      title: row.title,
      dek: row.dek,
      body: row.body,
      category: row.category,
    });
    if (slugs.length === 0) continue;
    await setArticleTopics(row.id, slugs);
    updated += 1;
  }

  console.log(`Topic backfill done: ${updated} / ${rows.length} articles tagged.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
