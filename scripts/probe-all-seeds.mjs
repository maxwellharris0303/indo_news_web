import { DEFAULT_RSS_FEEDS } from "../src/lib/rss/default-feeds.ts";
import { fetchAndParseFeed } from "../src/lib/rss/parse-feed.ts";

for (const feed of DEFAULT_RSS_FEEDS) {
  try {
    const r = await fetchAndParseFeed(feed.feedUrl, { siteUrl: feed.siteUrl });
    console.log(
      `OK\t${r.feed.items.length} items\t${feed.name}\t${r.resolvedFeedUrl ?? feed.feedUrl}`,
    );
  } catch (e) {
    console.log(
      `ERR\t${feed.name}\t${feed.feedUrl}\t${e instanceof Error ? e.message : e}`,
    );
  }
}
