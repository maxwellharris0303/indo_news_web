import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  articles,
  authors,
  factChecks,
  regions,
  topics,
} from "../src/lib/content/seed";

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.readingHistory.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.savedArticle.deleteMany();
  await prisma.articleTopic.deleteMany();
  await prisma.article.deleteMany();
  await prisma.factCheck.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.region.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();

  for (const author of authors) {
    await prisma.author.create({ data: author });
  }

  for (const region of regions) {
    await prisma.region.create({ data: region });
  }

  for (const topic of topics) {
    await prisma.topic.create({ data: topic });
  }

  for (const article of articles) {
    await prisma.article.create({
      data: {
        id: article.id,
        slug: article.slug,
        category: article.category,
        title: article.title,
        dek: article.dek,
        body: article.body,
        summaryBullets: JSON.stringify(article.summaryBullets),
        aiSummary: article.aiSummary ?? article.summaryBullets.join(" "),
        locale: article.locale,
        status: "PUBLISHED",
        galleryImages: JSON.stringify(article.galleryImages),
        videoUrl: article.videoUrl ?? null,
        publishedAt: new Date(article.publishedAt),
        updatedAt: article.updatedAt ? new Date(article.updatedAt) : null,
        correctionNote: article.correctionNote,
        authorId: article.authorId,
        regionSlug: article.regionSlug,
        imageUrl: article.imageUrl,
        imageCaption: article.imageCaption,
        imageCredit: article.imageCredit,
        verificationStatus: article.verificationStatus,
        sources: JSON.stringify(article.sources),
        featuredLevel: article.featuredLevel,
        isBreaking: article.isBreaking,
        breakingExpiresAt: article.breakingExpiresAt
          ? new Date(article.breakingExpiresAt)
          : null,
        viewCount: article.viewCount,
        topics: {
          create: article.topicSlugs.map((topicSlug) => ({ topicSlug })),
        },
      },
    });
  }

  for (const fc of factChecks) {
    await prisma.factCheck.create({
      data: {
        slug: fc.slug,
        claim: fc.claim,
        verdict: fc.verdict,
        explanation: fc.explanation,
        sources: JSON.stringify(fc.sources),
        publishedAt: new Date(fc.publishedAt),
        relatedArticleSlugs: JSON.stringify(fc.relatedArticleSlugs),
      },
    });
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@kabardesk.id",
      name: "Admin KabarDesk",
      passwordHash,
      role: "ADMIN",
    },
  });

  const readerHash = await bcrypt.hash("reader123", 10);
  await prisma.user.create({
    data: {
      email: "pembaca@kabardesk.id",
      name: "Pembaca Demo",
      passwordHash: readerHash,
      role: "READER",
      plan: "PLUS",
      interests: JSON.stringify(["nasional", "ekonomi"]),
      regionSlug: "dki-jakarta",
    },
  });

  const superEmail = process.env.KABARDESK_SUPERADMIN_EMAIL?.trim().toLowerCase();
  const superPassword = process.env.KABARDESK_SUPERADMIN_PASSWORD;
  if (superEmail && superPassword) {
    const superHash = await bcrypt.hash(superPassword, 10);
    await prisma.user.upsert({
      where: { email: superEmail },
      create: {
        email: superEmail,
        name: "Super Admin",
        passwordHash: superHash,
        role: "SUPERADMIN",
        plan: "PLUS",
      },
      update: {
        passwordHash: superHash,
        role: "SUPERADMIN",
      },
    });
    console.log(`Superadmin seed: ${superEmail}`);
  }

  console.log("Seed selesai: artikel + akun demo, admin@kabardesk.id / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
