/**
 * Set regionSlug on published articles that lack it (keyword inference).
 * Run: npx tsx scripts/backfill-article-regions.ts
 */
import { prisma } from "@/lib/db";
import { inferRegionSlugFromText } from "@/lib/regions/infer-region";

async function main() {
  const rows = await prisma.article.findMany({
    where: { regionSlug: null, status: { in: ["PUBLISHED", "CORRECTED"] } },
    select: { id: true, title: true, dek: true, body: true },
  });

  let updated = 0;
  for (const row of rows) {
    const slug = inferRegionSlugFromText({
      title: row.title,
      dek: row.dek,
      body: row.body,
    });
    if (!slug) continue;
    await prisma.article.update({
      where: { id: row.id },
      data: { regionSlug: slug },
    });
    updated += 1;
  }

  console.log(`Backfill done: ${updated} / ${rows.length} articles tagged.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
