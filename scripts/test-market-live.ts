import { buildLiveMarketSnapshot } from "../src/lib/market/build-snapshot";

async function main() {
  const snap = await buildLiveMarketSnapshot();
  console.log("OK market live");
  console.log(
    JSON.stringify(
      {
        usdIdr: snap.usdIdr,
        usdIdrChange: snap.usdIdrChange,
        ihsg: snap.ihsg,
        ihsgChange: snap.ihsgChange,
        goldBuy: snap.goldBuy,
        goldChange: snap.goldChange,
        updatedAt: snap.updatedAt,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error("Market live test failed:", e);
  process.exit(1);
});
