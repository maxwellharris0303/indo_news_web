/**
 * Poll RSS, rewrite N items with OpenAI, optionally publish (PUBLISHED).
 * VPS: BULK_COUNT=20 PUBLISH=1 npx tsx scripts/bulk-rss-rewrite.ts
 */
import { execSync } from "node:child_process";
import { PrismaClient, type RssItemStatus } from "@prisma/client";
import { aiProviderConfigured, rewriteArticleFromSource } from "../src/lib/ai/rewrite-article";
import { REWRITE_PROMPT_VERSION } from "../src/lib/ai/rewrite-schema";
import { createReviewArticleFromRewrite } from "../src/lib/rss/create-article-from-rewrite";
import { seedDefaultRssFeeds } from "../src/lib/rss/default-feeds";
import { ensureItemExtracted, pollAllEnabledFeeds } from "../src/lib/rss/poll-feeds";

const prisma = new PrismaClient();

const BULK_COUNT = Math.min(
  100,
  Math.max(1, Number(process.env.BULK_COUNT) || 20),
);
const PUBLISH = process.env.PUBLISH !== "0";
const AI_PROVIDER = (process.env.AI_PROVIDER || "OPENAI") as "OPENAI" | "ANTHROPIC";

async function resolveAuthorId(preferred: string): Promise<string> {
  const byId = await prisma.author.findUnique({ where: { id: preferred } });
  if (byId) return preferred;
  const any = await prisma.author.findFirst({ select: { id: true } });
  if (any) return any.id;
  await prisma.author.create({
    data: { id: "a-redaksi-rss", name: "Redaksi KabarDesk", title: "Redaksi" },
  });
  return "a-redaksi-rss";
}

async function pickNextItem(skipIds: Set<string>) {
  const queueStatus: RssItemStatus[] = ["NEW", "FAILED"];
  let item = await prisma.rssItem.findFirst({
    where: {
      articleId: null,
      id: { notIn: [...skipIds] },
      status: { in: queueStatus },
    },
    orderBy: { pubDate: "desc" },
    include: { feed: true },
  });
  if (!item) {
    item = await prisma.rssItem.findFirst({
      where: {
        articleId: null,
        id: { notIn: [...skipIds] },
        status: "NEW",
      },
      orderBy: { pubDate: "desc" },
      include: { feed: true },
    });
  }
  if (item?.status === "FAILED") {
    await prisma.rssItem.update({
      where: { id: item.id },
      data: { status: "NEW", lastError: null },
    });
  }
  return item;
}

async function rewriteOne(itemId: string): Promise<
  | { ok: true; category: string; slug: string; title: string }
  | { ok: false; error: string }
> {
  const item = await prisma.rssItem.findUnique({
    where: { id: itemId },
    include: { feed: true },
  });
  if (!item) return { ok: false, error: "item missing" };
  if (item.articleId) return { ok: false, error: "already has article" };

  const scrapeMode = item.feed.scrapeMode;
  let extracted = await ensureItemExtracted(item.id, scrapeMode);
  if (!extracted.ok) {
    extracted = await ensureItemExtracted(item.id, "FETCH_ARTICLE");
  }
  if (!extracted.ok) {
    await prisma.rssItem.update({
      where: { id: item.id },
      data: { status: "FAILED", lastError: extracted.error },
    });
    return { ok: false, error: extracted.error };
  }

  const fresh = await prisma.rssItem.findUnique({
    where: { id: item.id },
    include: { feed: true },
  });
  if (!fresh?.extractedBody || fresh.extractedBody.length < 80) {
    const err = "extracted body too short";
    await prisma.rssItem.update({
      where: { id: item.id },
      data: { status: "FAILED", lastError: err },
    });
    return { ok: false, error: err };
  }

  const job = await prisma.rewriteJob.create({
    data: {
      rssItemId: fresh.id,
      aiProvider: AI_PROVIDER,
      scrapeMode: fresh.feed.scrapeMode,
      status: "RUNNING",
      promptVersion: REWRITE_PROMPT_VERSION,
    },
  });

  await prisma.rssItem.update({
    where: { id: fresh.id },
    data: { status: "REWRITING", lastError: null },
  });

  const rewrite = await rewriteArticleFromSource({
    provider: AI_PROVIDER,
    sourceTitle: fresh.title,
    sourceUrl: fresh.link,
    sourceName: fresh.feed.name,
    body: fresh.extractedBody,
    locale: fresh.feed.defaultLocale,
  });

  if (!rewrite.ok) {
    await prisma.rewriteJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: rewrite.error, completedAt: new Date() },
    });
    await prisma.rssItem.update({
      where: { id: fresh.id },
      data: { status: "FAILED", lastError: rewrite.error },
    });
    return { ok: false, error: rewrite.error };
  }

  await prisma.rewriteJob.update({
    where: { id: job.id },
    data: {
      status: "COMPLETED",
      model: rewrite.model,
      outputJson: JSON.stringify(rewrite.output),
      completedAt: new Date(),
    },
  });

  const authorId = await resolveAuthorId(fresh.feed.defaultAuthorId);
  const created = await createReviewArticleFromRewrite({
    rssItemId: fresh.id,
    output: rewrite.output,
    authorId,
    locale: fresh.feed.defaultLocale,
    sourceUrl: fresh.link,
    sourceName: fresh.feed.name,
    imageUrl: fresh.imageUrl,
  });

  if (!created.ok) {
    await prisma.rssItem.update({
      where: { id: fresh.id },
      data: { status: "FAILED", lastError: created.error },
    });
    return { ok: false, error: created.error };
  }

  if (PUBLISH) {
    await prisma.article.update({
      where: { id: created.articleId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }

  return {
    ok: true,
    category: created.category,
    slug: created.slug,
    title: rewrite.output.title,
  };
}

async function main() {
  if (!aiProviderConfigured(AI_PROVIDER)) {
    console.error(`FAIL: ${AI_PROVIDER} API key not set`);
    process.exit(1);
  }

  await seedDefaultRssFeeds();
  console.log("Polling RSS…");
  const pollResults = await pollAllEnabledFeeds();
  for (const r of pollResults) {
    if (r.error) console.log(`[poll] ${r.name}: ERR ${r.error}`);
    else if (r.notModified) console.log(`[poll] ${r.name}: 304`);
    else console.log(`[poll] ${r.name}: +${r.newItems}`);
  }

  const published: { path: string; title: string }[] = [];
  const failed: { title: string; error: string }[] = [];
  const skip = new Set<string>();

  console.log(`\nTarget: ${BULK_COUNT} articles (publish=${PUBLISH})…\n`);

  while (published.length < BULK_COUNT) {
    const item = await pickNextItem(skip);
    if (!item) {
      console.log("No more RSS items in queue.");
      break;
    }
    skip.add(item.id);
    console.log(
      `[${published.length + 1}/${BULK_COUNT}] ${item.title.slice(0, 70)}… (${item.feed.name})`,
    );
    const res = await rewriteOne(item.id);
    if (res.ok) {
      published.push({
        path: `/${res.category}/${res.slug}`,
        title: res.title,
      });
      console.log(`  OK ${published[published.length - 1]!.path}`);
    } else {
      failed.push({ title: item.title, error: res.error });
      console.log(`  SKIP: ${res.error}`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Published: ${published.length}`);
  for (const p of published) {
    console.log(`  ${p.path}`);
  }
  if (failed.length) {
    console.log(`Skipped/failed: ${failed.length}`);
  }

  if (published.length === 0) process.exit(1);

  try {
    execSync("node scripts/sync-standalone-db.mjs", { stdio: "inherit" });
  } catch {
    console.warn("Could not sync standalone DB — run deploy or sync manually, then pm2 restart");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
