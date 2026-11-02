#!/usr/bin/env node
/** Quick probe of RSS candidate URLs (run: node scripts/probe-rss-urls.mjs) */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const urls = [
  "https://www.kompas.com/rss/read/all/",
  "https://www.kompas.com/getrss/all",
  "https://www.kompas.com/getrss/nasional",
  "https://rss.kompas.com/api/feed/social?apikey=bc58c81819dff4b8d5c53540a2fc7ffd83e6314a",
  "https://www.suara.com/rss/news",
  "https://www.suara.com/rss/bisnis",
  "https://www.suara.com/feed",
  "https://www.inews.id/rss/latest",
  "https://www.inews.id/rss",
  "https://www.inews.id/feed",
  "https://www.inilah.com/rss/feed/",
  "https://www.inilah.com/feed",
  "https://inilah.com/rss/feed/",
  "https://news.ddtc.co.id/rss",
  "https://news.ddtc.co.id/feed",
  "https://news.ddtc.co.id/rss.xml",
  "https://news.ddtc.co.id/feed/rss",
  "https://media.sindonews.com/rss",
  "https://multimedia.sindonews.com/rss",
  "https://www.detik.com/rss",
  "https://news.detik.com/berita/rss",
  "https://nasional.suara.com/rss",
  "https://bisnis.suara.com/rss",
  "https://www.suara.com/rss.xml",
  "https://www.suaracom.id/rss",
  "https://ddtc.co.id/feed",
  "https://www.ddtc.co.id/feed",
  "https://news.ddtc.co.id/sitemap.xml",
  "https://www.inilah.com/rss",
  "https://www.inilah.com/rss.xml",
  "https://api.inilah.com/rss",
  "https://international.sindonews.com/rss",
  "https://sindonews.com/rss",
  "https://www.kompas.id/rss",
  "https://www.kompas.tv/rss",
];

async function probe(url) {
  try {
    const ref = new URL(url).origin + "/";
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        Referer: ref,
        "Accept-Language": "id-ID,id;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    const text = await res.text();
    const hasItem = /<item[\s>]/i.test(text) || /<entry[\s>]/i.test(text);
    const preview = text.slice(0, 120).replace(/\s+/g, " ");
    console.log(
      `${res.status}\t${text.length}\t${hasItem ? "RSS" : "----"}\t${url}`,
    );
    if (!hasItem && text.length < 200) console.log(`    ${preview}`);
  } catch (e) {
    console.log(`ERR\t0\t----\t${url}\t${e.message}`);
  }
}

for (const u of urls) await probe(u);
