import { pollAllEnabledFeeds } from "../src/lib/rss/poll-feeds";
import { seedDefaultRssFeeds } from "../src/lib/rss/default-feeds";

async function main() {
  await seedDefaultRssFeeds();
  const results = await pollAllEnabledFeeds();
  for (const r of results) {
    if (r.error) {
      console.error(`[ERR] ${r.name}: ${r.error}`);
    } else if (r.notModified) {
      console.log(`[304] ${r.name}`);
    } else {
      console.log(`[OK] ${r.name}: +${r.newItems} items`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
