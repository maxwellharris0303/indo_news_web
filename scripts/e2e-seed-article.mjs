/**
 * Creates a published test article for E2E (idempotent slug).
 */
import { PrismaClient } from "@prisma/client";

const slug = "e2e-automation-test-article";
const prisma = new PrismaClient();

try {
  await prisma.article.upsert({
    where: { category_slug: { category: "nasional", slug } },
    create: {
      id: "e2e-auto-article",
      slug,
      category: "nasional",
      title: "E2E Automation Test Article KabarDesk",
      dek: "Artikel uji otomatis untuk memastikan halaman publikasi admin berfungsi.",
      body:
        "Ini isi artikel uji coba otomatis. " +
        "Paragraf kedua memastikan panjang body memenuhi validasi CMS dan render halaman artikel.",
      summaryBullets: JSON.stringify([
        "Artikel uji E2E.",
        "Dibuat otomatis.",
        "Jangan dihapus manual saat CI.",
      ]),
      aiSummary: "Artikel uji otomatis KabarDesk.",
      publishedAt: new Date(),
      authorId: "a1",
      imageUrl: "https://picsum.photos/seed/kabardesk-e2e/1200/750",
      imageCaption: "E2E",
      imageCredit: "KabarDesk",
      sources: JSON.stringify(["E2E"]),
      locale: "id",
      status: "PUBLISHED",
      galleryImages: "[]",
      featuredLevel: 0,
      viewCount: 0,
    },
    update: {
      status: "PUBLISHED",
      title: "E2E Automation Test Article KabarDesk",
    },
  });
  console.log(`OK seeded /nasional/${slug}`);
} finally {
  await prisma.$disconnect();
}
