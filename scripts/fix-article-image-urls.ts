import { PrismaClient } from "@prisma/client";
import {
  normalizeImageUrl,
  picsumCoverForSlug,
} from "../src/lib/article-image";

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    select: { id: true, slug: true, imageUrl: true },
  });
  let updated = 0;
  for (const a of articles) {
    const normalized = normalizeImageUrl(a.imageUrl);
    const next = normalized ?? picsumCoverForSlug(a.slug);
    if (next !== a.imageUrl) {
      await prisma.article.update({
        where: { id: a.id },
        data: { imageUrl: next },
      });
      updated += 1;
      console.log(`fixed ${a.slug}`);
    }
  }
  console.log(`Done. Updated ${updated} / ${articles.length} articles.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
