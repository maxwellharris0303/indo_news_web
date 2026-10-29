import assert from "node:assert/strict";
import { parseRewriteJson } from "../src/lib/ai/rewrite-schema";
import { contentHash, normalizeArticleUrl } from "../src/lib/rss/normalize-url";
import { mapParserItem, parseFeedXml } from "../src/lib/rss/parse-feed";
import { extractArticleFromHtml } from "../src/lib/rss/scrape-article";
import { slugify } from "../src/lib/slugify";
import { PrismaClient } from "@prisma/client";
import { seedDefaultRssFeeds } from "../src/lib/rss/default-feeds";
const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <guid>test-guid-1</guid>
      <link>https://example.com/news/1?utm_source=x</link>
      <title>Judul Berita Uji</title>
      <pubDate>Wed, 29 Oct 2025 10:00:00 GMT</pubDate>
      <description>Ringkasan singkat berita.</description>
    </item>
  </channel>
</rss>`;

const SAMPLE_HTML = `<!DOCTYPE html><html><head>
<title>Original</title>
<meta property="og:image" content="https://example.com/img.jpg" />
</head><body><article><h1>Original</h1><p>${"Paragraf panjang. ".repeat(40)}</p></article></body></html>`;

function testNormalizeUrl() {
  const a = normalizeArticleUrl(
    "https://example.com/a?utm_source=x&id=1",
  );
  const b = normalizeArticleUrl("https://example.com/a?id=1");
  assert.equal(a, b);
  assert.equal(contentHash("T", a), contentHash("t", b));
}

async function testParseRss() {
  const feed = await parseFeedXml(SAMPLE_RSS);
  assert.equal(feed.items.length, 1);
  assert.equal(feed.items[0]?.title, "Judul Berita Uji");
  assert.ok(feed.items[0]?.link.includes("example.com"));
}

function testScrape() {
  const r = extractArticleFromHtml(
    SAMPLE_HTML,
    "https://example.com/news/1",
  );
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.ok(r.textContent.length > 200);
    assert.equal(r.imageUrl, "https://example.com/img.jpg");
  }
}

function testRewriteJsonParse() {
  const raw = JSON.stringify({
    title: "Judul cukup panjang untuk validasi",
    dek: "Dek yang memenuhi syarat minimal panjang.",
    body: "x".repeat(100),
    summaryBullets: ["Poin satu cukup panjang", "Poin dua cukup panjang"],
    suggestedCategory: "nasional",
    attributionLine: "Berdasarkan laporan Example.com",
    confidence: "high",
  });
  const out = parseRewriteJson(raw);
  assert.equal(out.suggestedCategory, "nasional");
}

function testSlugify() {
  assert.equal(slugify("Hello World!"), "hello-world");
}

async function testDbFeedUpsertAndPollMock() {
  const prisma = new PrismaClient();
  try {
    await seedDefaultRssFeeds();
    const count = await prisma.rssFeed.count();
    assert.ok(count >= 8);

    const feed = await prisma.rssFeed.create({
      data: {
        name: "Test Unit Feed",
        siteUrl: "https://example.com",
        feedUrl: `https://example.com/test-rss-${Date.now()}.xml`,
        enabled: false,
        scrapeMode: "RSS_ONLY",
      },
    });

    const item = await prisma.rssItem.create({
      data: {
        feedId: feed.id,
        guid: `g-${Date.now()}`,
        link: `https://example.com/item-${Date.now()}`,
        title: "Item uji",
        summaryRaw: "Ringkasan",
        status: "NEW",
      },
    });
    assert.ok(item.id);

    await prisma.rssItem.delete({ where: { id: item.id } });
    await prisma.rssFeed.delete({ where: { id: feed.id } });
  } finally {
    await prisma.$disconnect();
  }
}

function testMapParserItemMinimal() {
  const mapped = mapParserItem({
    title: "T",
    link: "https://x.com/1",
    guid: "g1",
  });
  assert.ok(mapped);
  assert.equal(mapped?.guid, "g1");
}

async function runOnce(label: string) {
  console.log(`--- Run ${label} ---`);
  testNormalizeUrl();
  await testParseRss();
  testScrape();
  testRewriteJsonParse();
  testSlugify();
  testMapParserItemMinimal();
  await testDbFeedUpsertAndPollMock();
  console.log(`OK ${label}`);
}

async function main() {
  await runOnce("1/3");
  await runOnce("2/3");
  await runOnce("3/3");
  console.log("All RSS system tests passed (3 runs).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
