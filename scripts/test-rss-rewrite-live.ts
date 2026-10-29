/**
 * Live integration: poll feeds, rewrite one NEW item with OpenAI.
 * Requires OPENAI_API_KEY on server. Run: npx tsx scripts/test-rss-rewrite-live.ts
 */
import { PrismaClient } from "@prisma/client";
import { aiProviderConfigured } from "../src/lib/ai/rewrite-article";
import { createReviewArticleFromRewrite } from "../src/lib/rss/create-article-from-rewrite";
import { seedDefaultRssFeeds } from "../src/lib/rss/default-feeds";
import {
  ensureItemExtracted,
  pollAllEnabledFeeds,
} from "../src/lib/rss/poll-feeds";
import { rewriteArticleFromSource } from "../src/lib/ai/rewrite-article";
import { REWRITE_PROMPT_VERSION } from "../src/lib/ai/rewrite-schema";

const prisma = new PrismaClient();

async function main() {
  if (!aiProviderConfigured("OPENAI")) {
    console.error("FAIL: OPENAI_API_KEY not set");
    process.exit(1);
  }

  await seedDefaultRssFeeds();
  console.log("Polling enabled RSS feeds…");
  const pollResults = await pollAllEnabledFeeds();
  for (const r of pollResults) {
    console.log(
      `[poll] ${r.name}: +${r.newItems}${r.error ? ` ERR ${r.error}` : ""}`,
    );
  }

  let item = await prisma.rssItem.findFirst({
    where: {
      status: "NEW",
      articleId: null,
      OR: [
        { extractedBody: { not: null } },
        { contentRaw: { not: null } },
        { summaryRaw: { not: null } },
      ],
    },
    orderBy: { pubDate: "desc" },
    include: { feed: true },
  });

  if (!item) {
    item = await prisma.rssItem.findFirst({
      where: { status: "FAILED", articleId: null },
      orderBy: { updatedAt: "desc" },
      include: { feed: true },
    });
    if (item) {
      await prisma.rssItem.update({
        where: { id: item.id },
        data: { status: "NEW", lastError: null },
      });
    }
  }

  if (!item) {
    console.error("FAIL: no RSS item available to rewrite after poll");
    process.exit(1);
  }

  console.log(`Rewriting item: ${item.title.slice(0, 60)}… (${item.feed.name})`);

  const scrapeMode = item.feed.scrapeMode;
  const extracted = await ensureItemExtracted(item.id, scrapeMode);
  if (!extracted.ok) {
    const fallback = await ensureItemExtracted(item.id, "FETCH_ARTICLE");
    if (!fallback.ok) {
      console.error("FAIL extract:", extracted.error, fallback.error);
      process.exit(1);
    }
  }

  const fresh = await prisma.rssItem.findUnique({
    where: { id: item.id },
    include: { feed: true },
  });
  if (!fresh?.extractedBody || fresh.extractedBody.length < 80) {
    console.error("FAIL: extracted body too short");
    process.exit(1);
  }

  const job = await prisma.rewriteJob.create({
    data: {
      rssItemId: fresh.id,
      aiProvider: "OPENAI",
      scrapeMode: fresh.feed.scrapeMode,
      status: "RUNNING",
      promptVersion: REWRITE_PROMPT_VERSION,
    },
  });

  const rewrite = await rewriteArticleFromSource({
    provider: "OPENAI",
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
    console.error("FAIL rewrite:", rewrite.error);
    process.exit(1);
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

  const created = await createReviewArticleFromRewrite({
    rssItemId: fresh.id,
    output: rewrite.output,
    authorId: fresh.feed.defaultAuthorId,
    locale: fresh.feed.defaultLocale,
    sourceUrl: fresh.link,
    sourceName: fresh.feed.name,
    imageUrl: fresh.imageUrl,
  });

  if (!created.ok) {
    console.error("FAIL create article:", created.error);
    process.exit(1);
  }

  console.log("OK rewrite live test");
  console.log(`  model: ${rewrite.model}`);
  console.log(`  article: /${created.category}/${created.slug}`);
  console.log(`  title: ${rewrite.output.title}`);
  console.log(`  confidence: ${rewrite.output.confidence}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
