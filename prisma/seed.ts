import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import {
  articles,
  authors,
  factChecks,
  regions,
  topics,
} from "../src/lib/content/seed";

/** tsx does not load `.env`; without this, VPS deploy can run the dev wipe. */
function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

function shouldPreserveExistingData(): boolean {
  if (process.env.KABARDESK_PRESERVE_DATA === "1") return true;
  if (process.env.NODE_ENV === "production") return true;
  const db = process.env.DATABASE_URL ?? "";
  if (db.includes("/var/www/kabardesk")) return true;
  return false;
}

const prisma = new PrismaClient();

const DEMO_ADMIN_ID = "u-demo-admin";
const DEMO_READER_ID = "u-demo-reader";
const SUPERADMIN_ID = "u-superadmin";

async function upsertDemoUsers() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@kabardesk.id" },
    create: {
      id: DEMO_ADMIN_ID,
      email: "admin@kabardesk.id",
      name: "Admin KabarDesk",
      passwordHash,
      role: "ADMIN",
    },
    update: {
      name: "Admin KabarDesk",
      passwordHash,
      role: "ADMIN",
    },
  });

  const readerHash = await bcrypt.hash("reader123", 10);
  await prisma.user.upsert({
    where: { email: "pembaca@kabardesk.id" },
    create: {
      id: DEMO_READER_ID,
      email: "pembaca@kabardesk.id",
      name: "Pembaca Demo",
      passwordHash: readerHash,
      role: "READER",
      plan: "PLUS",
      interests: JSON.stringify(["nasional", "ekonomi"]),
      regionSlug: "dki-jakarta",
    },
    update: {
      name: "Pembaca Demo",
      passwordHash: readerHash,
      role: "READER",
      plan: "PLUS",
    },
  });

  const superEmail = process.env.KABARDESK_SUPERADMIN_EMAIL?.trim().toLowerCase();
  const superPassword = process.env.KABARDESK_SUPERADMIN_PASSWORD;
  if (superEmail && superPassword) {
    const superHash = await bcrypt.hash(superPassword, 10);
    await prisma.user.upsert({
      where: { email: superEmail },
      create: {
        id: SUPERADMIN_ID,
        email: superEmail,
        name: "Super Admin",
        passwordHash: superHash,
        role: "SUPERADMIN",
        plan: "PLUS",
      },
      update: {
        passwordHash: superHash,
        role: "SUPERADMIN",
        plan: "PLUS",
      },
    });
    console.log(`Superadmin seed: ${superEmail}`);
  }
}

async function seedProduction() {
  await upsertDemoUsers();
  const { seedDefaultRssFeeds } = await import("../src/lib/rss/default-feeds");
  await seedDefaultRssFeeds();
  const { seedDemoArticleComments } = await import(
    "../src/lib/content/seed-comments"
  );
  const commentsAdded = await seedDemoArticleComments(prisma);
  console.log(
    `Production seed: demo users + RSS feeds (data preserved); +${commentsAdded} demo comments`,
  );
}

async function seedDevelopment() {
  await prisma.rewriteJob.deleteMany();
  await prisma.rssItem.deleteMany();
  await prisma.rssFeed.deleteMany();
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
        isDeveloping: article.isDeveloping,
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

  await upsertDemoUsers();

  const { seedDefaultRssFeeds } = await import("../src/lib/rss/default-feeds");
  await seedDefaultRssFeeds();
  console.log("RSS feeds default: 8 sumber");

  const { seedDemoArticleComments } = await import(
    "../src/lib/content/seed-comments"
  );
  const commentsAdded = await seedDemoArticleComments(prisma);
  console.log(`Demo comments: ${commentsAdded} rows`);

  console.log("Seed selesai: artikel + akun demo, admin@kabardesk.id / admin123");
}

async function main() {
  loadDotEnv();
  if (shouldPreserveExistingData()) {
    await seedProduction();
    return;
  }
  await seedDevelopment();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
